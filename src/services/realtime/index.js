import JSON from "@/src/services/json";

class SocketManager {
  connected = false;
  topic = null;
  ws = null;
  closed = false;
  retryInterval = 1000;
  maxRetryInterval = 30000;
  callback = null;

  constructor(topic) {
    this.topic = topic;
    console.log("Topic registered", this.topic);
  }

  connect(callback) {
    if (this.closed) {
      console.log("Socket is already closed.");
      return;
    }

    // Store the callback for reuse on reconnection
    if (callback) {
      this.callback = callback;
    }

    this.ws = new WebSocket(`ws://socket.pasahero.app?topic=${this.topic}`);

    // Handle open event
    this.ws.onopen = () => {
      console.log("Socket opened");
      this.connected = true;
      this.retryInterval = 1000; // Reset retry interval on successful connection
    };

    // Handle message event
    this.ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      this.callback?.(data);
    };

    // Handle error event
    this.ws.onerror = (error) => {
      console.log(
        "Socket encountered error:",
        error.message,
        "Closing socket for topic",
        this.topic
      );
      this.ws.close();
    };

    // Handle close event and trigger reconnection logic
    this.ws.onclose = (e) => {
      console.log("Socket closed", e.code, e.reason);
      this.connected = false;

      // Clean up event listeners
      this.ws.onopen = undefined;
      this.ws.onmessage = undefined;
      this.ws.onerror = undefined;
      this.ws.onclose = undefined;

      if (this.closed) {
        console.log(
          "Socket is closed by user, no reconnection will be attempted."
        );
        return;
      }

      // Schedule reconnection with exponential backoff
      setTimeout(() => {
        console.log("Attempting to reconnect...");
        this.connect();
      }, this.retryInterval);

      // Double the retry interval for exponential backoff
      if (this.retryInterval < this.maxRetryInterval) {
        this.retryInterval *= 2;
      }
    };

    // Return the unsubscribe function
    return () => {
      console.log("Closing socket connection");
      this.closed = true;
      this.ws.close();
    };
  }
}

export default function subscribe(topic, callback) {
  const socket = new SocketManager(topic);
  return socket.connect(callback);
}
