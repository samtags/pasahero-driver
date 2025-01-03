import Mapbox from "@rnmapbox/maps";
import { useEffect, useRef, useState } from "react";
import { useMMKVString } from "react-native-mmkv";
import { Skeleton } from "moti/skeleton";
import { Image } from "expo-image";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import * as Linking from "expo-linking";
import LottieView from "lottie-react-native";
import { useMutation } from "@tanstack/react-query";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import * as turf from "@turf/turf";

import useTrip from "@/src/services/queries/useTrip";
import Preview from "./components/Preview";
import Optional from "@/src/components/optional";
import Text from "@/src/components/text";
import Cta from "@/src/components/cta";
import useOnUpdate from "@/src/services/hooks/useOnUpdate";
import BackButton from "@/src/components/back";
import cancelMatchRequest from "@/src/services/api/cancelMatchRequest";
import { format } from "@/src/services/util/amount";
import calculateBoundingBox from "@/src/services/util/map/calculateBoundingBox";
import storage from "@/src/services/storage";
import log from "@/src/services/log";
import rebook from "@/src/services/api/rebook";
import router, { useRouterParams } from "@/src/services/router";
import getDistance from "@/src/services/util/haversine/getDistance";
import getColorByService from "@/src/services/util/colors/getColorByService";
import handleGetPlatformByService from "@/src/services/util/trip/handleGetPlatformByService";
import Track from "@/src/services/trip/Track";
import {
  call,
  first,
  from,
  last,
  message,
  share,
  to,
  motorJoyRideIcon,
  motorAngkasIcon,
  motorMoveItIcon,
} from "@/src/services/images/remote";
import {
  ScrollView,
  TouchableOpacity as TouchableOpacityGuesture,
} from "react-native-gesture-handler";
import useRenderCounter from "@/src/services/hooks/useRenderCounter";
import completeTrip from "@/src/services/api/completeTrip";
import subscribe from "@/src/services/realtime";
import getLocation from "@/src/services/api/getLocation";
import { resetTrips } from "@/src/services/queries/useTrips";

const DEFAULT_LOCATION = {
  latitude: 14.5535991,
  longitude: 121.0106671,
};

export default function Trip() {
  const scrollRef = useRef();
  const cameraRef = useRef();

  const params = useRouterParams();
  const trip = useTrip(params?.id, params);

  const [tripDraft] = useMMKVString("trip.draft");
  const draft = JSON.parse(tripDraft ?? "{}");

  const [showInstruction, setShowInstruction] = useState(false);
  const [showCancelationPrompt, setShowCancelationPrompt] = useState(false);
  const [showRequestTimeoutPrompt, setShowRequestTimeoutPrompt] = useState(false); // prettier-ignore
  const [assignedEta, setAssignedEta] = useState("");
  const [eta, setEta] = useState("");
  const [previewHeight, setPreviewHeight] = useState(220);

  const [screen, setScreen] = useState("PENDING");
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const { isPending: isCanceling, mutateAsync: handleCancel } = useMutation({
    mutationFn: () => cancelMatchRequest({ id: trip?.id }),
    onSuccess: () => router.replace({ pathname: "/" }),
  });

  const initialCoordinates = [
    trip?.first_point?.longitude ?? draft?.first?.longitude,
    trip?.first_point?.latitude ?? draft?.first?.latitude,
  ];

  const [showFeedback, setShowFeedback] = useState(false);

  const isCoordinatesReady = Boolean(
    trip?.first_point?.longitude && trip?.first_point?.latitude
  );

  const nearbyDriverIds = [];

  function initializeMap() {
    if (isMapInitialized) return;
    setIsMapInitialized(true);
  }

  function handleGoToMessages() {
    router.navigate({
      pathname: `/chat`,
      params: {
        id: trip.id,
        driver_id: trip?.driver_id,
        first_name: trip?.first_name,
        last_name: trip?.last_name,
        image_url: trip?.image_url,
        service: trip?.service,
        passenger_id: trip?.passenger_id,
      },
    });
  }

  function handleCallDriver() {
    router.navigate({
      pathname: "/dial",
      params: {
        roomId: trip?.driver_id,
      },
    });
  }

  function handleOnPressCancel() {
    scrollRef?.current?.scrollTo({ y: 0, animated: true });
    handleCancel();
  }

  function handleSubmitFeedback(feedback) {
    // todo: do something with the feedback
    console.debug(feedback);
    setShowFeedback(false);

    router.replace({ pathname: "/" });
  }

  function highlightPreview() {
    scrollRef?.current?.scrollTo({ y: 0, animated: true });
  }

  async function handleCreateTrip(attempt = 0) {
    if (attempt > 2) {
      log.warn("Unable to create trip after 3 attempts");
      Alert.alert("Unable to find driver", "Please try again later.", [
        {
          text: "OK",
          onPress: () => router.replace({ pathname: "/" }),
        },
      ]);
      throw new Error(500);
    }

    log.debug(`[${attempt}] Creating trip`, { match: trip });
    let error;

    const createTripResponse = await rebook(trip.id).catch(() => {
      error = true;
    });

    if (error) {
      log.warn(`[${attempt}] Failed to create trip`, { match: trip });
      return await handleCreateTrip(attempt + 1);
    }

    return createTripResponse;
  }

  async function handleRecreateTrip() {
    const recreatedTrip = await handleCreateTrip();
    log.debug("Redirecting to the new match", { recreatedTrip });

    router.replace({
      pathname: `/trip`,
      params: recreatedTrip,
    });
  }

  function handleConfirmFromCancelationPrompt() {
    handleRecreateTrip();
    setScreen("PENDING");
    setShowCancelationPrompt(false);
    if (cameraRef?.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [
          trip?.first_point?.longitude,
          trip?.first_point?.latitude,
        ],
        animationMode: "flyTo",
      });
    }
  }

  function handleConfirmFromRequestTimeoutPrompt() {
    handleRecreateTrip();
    setScreen("PENDING");
    setShowRequestTimeoutPrompt(false);

    if (cameraRef?.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [
          trip?.first_point?.longitude,
          trip?.first_point?.latitude,
        ],
        animationMode: "flyTo",
      });
    }
  }

  function handleCancelFromCancelationPrompt() {
    router.replace({ pathname: "/" });
  }

  function handleCancelFromRequestTimeoutPrompt() {
    router.replace({ pathname: "/" });
    // todo: refetch get matches query
  }

  useOnUpdate(() => {
    if (trip.id === params?.id) {
      if (trip?.status === "DRIVER_CANCELED") {
        scrollRef?.current?.scrollTo({ y: 0, animated: false });
        setShowCancelationPrompt(true);
      }

      if (trip?.status === "REQUEST_TIMEOUT") {
        scrollRef?.current?.scrollTo({ y: 0, animated: false });
        setShowRequestTimeoutPrompt(true);
      }
    }

    if (trip?.status === "REQUESTED") {
      setScreen("REQUESTED");
    }

    if (trip?.status === "FOUND") {
      setScreen("FOUND");
      highlightPreview();
    }

    if (trip?.status === "ARRIVED") {
      setScreen("ARRIVED");
      highlightPreview();

      handleChangePickupReference(trip?.last_point);
    }

    if (trip?.status === "STARTED") {
      highlightPreview();
      setScreen("STARTED");
    }

    if (trip?.status === "DONE") {
      highlightPreview();

      const timer = setTimeout(() => {
        setShowFeedback(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [trip]);

  let driverIcon = motorAngkasIcon;
  if (trip?.service === "mc-taxi") driverIcon = motorJoyRideIcon;
  if (trip?.service === "move-it") driverIcon = motorMoveItIcon;

  return (
    <>
      <BackButton />
      <View style={styles.container}>
        <Optional condition={showFeedback}>
          <Feedback
            onClose={() => setShowFeedback(false)}
            onSubmit={(feedback) => handleSubmitFeedback(feedback)}
          />
        </Optional>

        <Mapbox.MapView
          scaleBarEnabled={false}
          style={[styles.map, { opacity: isMapInitialized ? 1 : 0 }]}
          // styleURL="mapbox://styles/mapbox/streets-v12"
          // styleURL="mapbox://styles/mapbox/outdoors-v12"
          // styleURL="mapbox://styles/mapbox/light-v11"
          styleURL="mapbox://styles/mapbox/streets-v12"
          logoPosition={{ top: -100, left: 0 }}
          attributionEnabled={false}
          regionDidChangeDebounceTime={1000}
          onDidFinishLoadingStyle={initializeMap}
        >
          <Mapbox.Images
            images={{
              driverIcon,
              first,
              last,
            }}
          />
          <Optional
            fallback={
              <Mapbox.Camera
                animationMode="none"
                zoomLevel={12.76}
                pitch={45}
                centerCoordinate={[
                  DEFAULT_LOCATION.longitude,
                  DEFAULT_LOCATION.latitude,
                ]}
              />
            }
            condition={isCoordinatesReady}
          >
            <Mapbox.Camera
              ref={cameraRef}
              animationMode="none"
              zoomLevel={16.75}
              pitch={45}
              centerCoordinate={initialCoordinates}
            />
            <Optional condition={screen === "REQUESTED"}>
              <Mapbox.MarkerView
                coordinate={[
                  trip?.first_point?.longitude,
                  trip?.first_point?.latitude,
                ]}
              >
                <View
                  style={{
                    position: "absolute",
                    height: 220,
                    width: 220,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    style={styles.marker}
                    cachePolicy="memory-disk"
                    source={first}
                  />
                </View>
                <LottieView
                  autoPlay
                  loop
                  style={{
                    width: 220,
                    height: 220,
                    opacity: trip?.status === "REQUESTED" ? 1 : 0,
                  }}
                  source={require("../../assets/json/pulse.json")}
                />
              </Mapbox.MarkerView>

              {nearbyDriverIds.map((id) => (
                <DriverIcon key={id} id={id} />
              ))}
            </Optional>

            <Optional condition={screen === "FOUND"}>
              <Route
                destinationMarker="first"
                id={trip.driver_id}
                location={trip.first_point}
                service={trip.service}
                setEta={setAssignedEta}
              />
            </Optional>

            <Optional condition={screen === "ARRIVED"}>
              <ArrivedMap
                driver_id={trip.driver_id}
                pickup={trip.first_point}
              />
            </Optional>

            <Optional condition={screen === "STARTED"}>
              <Route
                destinationMarker="last"
                id={trip.driver_id}
                location={trip.last_point}
                service={trip.service}
                setEta={setEta}
              />
            </Optional>

            <Optional condition={screen === "DONE"}>
              <DoneMap destination={trip.last_point} />
            </Optional>
          </Optional>
        </Mapbox.MapView>

        <View style={{ height: previewHeight, zIndex: 4 }}>
          <ScrollView
            ref={scrollRef}
            horizontal={false}
            // pagingEnabled
            // snapToAlignment="end"
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={{ gap: 8 }}
          >
            <Optional
              condition={
                trip?.status === "REQUESTED" ||
                screen === "PENDING" ||
                trip?.status === "DRIVER_CANCELED" ||
                trip?.status === "REQUEST_TIMEOUT"
              }
            >
              <RequestedPreview
                services={trip?.services}
                onChangeHeight={setPreviewHeight}
              />
            </Optional>

            <Optional condition={trip?.status === "FOUND"}>
              <FoundPreview
                onChangeHeight={(h) => {
                  console.debug("🚀 ~ h:", h);
                  setPreviewHeight(h);
                }}
                onMessage={handleGoToMessages}
                onCall={handleCallDriver}
                driver_id={trip?.driver_id}
                eta={assignedEta}
                first_name={trip?.first_name}
                last_name={trip?.last_name}
                image_url={trip?.image_url}
                vehicle_make={trip?.vehicle_make}
                vehicle_model={trip?.vehicle_model}
                vehicle_plate_number={trip?.vehicle_plate_number}
                vehicle_color={trip?.vehicle_color}
                platform={trip?.platform}
                service={trip?.service}
              />
            </Optional>

            <Optional condition={trip?.status === "STARTED"}>
              <StartedPreview
                id={trip.id}
                onChangeHeight={setPreviewHeight}
                onTransfer={() => {
                  setShowInstruction(true);
                  scrollRef?.current?.scrollTo({ y: 0, animated: true });
                }}
                eta={eta}
                first_name={trip?.first_name}
                last_name={trip?.last_name}
                image_url={trip?.image_url}
                vehicle_make={trip?.vehicle_make}
                vehicle_model={trip?.vehicle_model}
                vehicle_plate_number={trip?.vehicle_plate_number}
                vehicle_color={trip?.vehicle_color}
                platform={trip?.platform}
                service={trip?.service}
              />
            </Optional>

            <Optional condition={trip?.status === "ARRIVED"}>
              <ArrivedPreview
                onMessage={handleGoToMessages}
                onChangeHeight={setPreviewHeight}
                onCall={handleCallDriver}
                onTransfer={() => {
                  setShowInstruction(true);
                  scrollRef?.current?.scrollTo({ y: 0, animated: true });
                }}
                first_name={trip?.first_name}
                last_name={trip?.last_name}
                image_url={trip?.image_url}
                vehicle_make={trip?.vehicle_make}
                vehicle_model={trip?.vehicle_model}
                vehicle_plate_number={trip?.vehicle_plate_number}
                vehicle_color={trip?.vehicle_color}
                platform={trip?.platform}
                service={trip?.service}
              />
            </Optional>

            <Optional condition={trip?.status === "DONE"}>
              <DonePreview
                first_name={trip?.first_name}
                last_name={trip?.last_name}
                image_url={trip?.image_url}
                vehicle_make={trip?.vehicle_make}
                vehicle_model={trip?.vehicle_model}
                vehicle_plate_number={trip?.vehicle_plate_number}
                vehicle_color={trip?.vehicle_color}
                platform={trip?.platform}
                service={trip?.service}
              />
            </Optional>

            <Optional condition={Boolean(trip)}>
              <TransitPoints
                showShareRide={["FOUND", "ARRIVED", "STARTED"].includes(trip?.status)} // prettier-ignore
                onShareRide={() => {
                  Linking.openURL(`https://web.pasahero.app/${trip.id}`);
                }}
                first_point={trip?.first_point}
                last_point={trip?.last_point}
              />

              <FareDetails
                estimatePreview={trip?.fare?.estimate_preview}
                showCancelOption={["REQUESTED", "FOUND"].includes(trip?.status)}
                serviceCharge={trip?.passenger_service_charge}
                isCanceling={isCanceling}
                onCancel={handleOnPressCancel}
              />
            </Optional>
          </ScrollView>
        </View>

        <Optional condition={showInstruction}>
          <View
            style={{
              position: "absolute",
              backgroundColor: "#00000029",
              height: "100%",
              width: "100%",
              zIndex: 4,
            }}
          >
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
              <View
                style={{
                  backgroundColor: "white",
                  paddingHorizontal: 18,
                  paddingVertical: 32,
                  borderTopLeftRadius: 34,
                  borderTopRightRadius: 34,
                }}
              >
                <Text size={28} weight="bold" color="#353579">
                  H'wag mag habal
                </Text>

                <View style={{ marginVertical: 30, gap: 12 }}>
                  <Text size={18} weight="bold" color="#1B1B1B">
                    Paano ilipat ang biyahe sa{" "}
                    {handleGetPlatformByService(trip.service) || "[platform]"}?
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      if (Platform.OS === "android") {
                        if (trip?.service === "angkas") router.navigate({pathname: "/transfer-angkas"}); // prettier-ignore
                        if (trip?.service === "mc-taxi") router.navigate({pathname: "/transfer-joyride"}); // prettier-ignore
                        if (trip?.service === "moto-taxi") router.navigate({pathname: "/transfer-move-it"}); // prettier-ignore
                      }
                    }}
                  >
                    <Text size={14} color="#707070">
                      <Text
                        style={{ textDecorationLine: "underline" }}
                        size={14}
                        color="#707070"
                        weight="700"
                      >
                        Bisitahin ang pahinang ito{" "}
                      </Text>
                      upang tingnan kung paano ilipat ang biyahe sa{" "}
                      {handleGetPlatformByService(trip.service) || "[platform]"}
                      .
                    </Text>
                  </TouchableOpacity>
                </View>

                <Cta
                  onPress={() => setShowInstruction(false)}
                  textColor="#D1D5DB"
                  color="transparent"
                >
                  Isara
                </Cta>
                <View style={{ marginBottom: 8 }} />
                <Cta
                  onPress={() => {
                    if (Platform.OS === "android") {
                      if (trip?.service === "angkas") Linking.openURL("https://play.google.com/store/apps/details?id=com.angkas.customer"); // prettier-ignore
                      if (trip?.service === "mc-taxi") Linking.openURL("https://play.google.com/store/apps/details?id=com.joyride.rider&hl=en_US"); // prettier-ignore
                      if (trip?.service === "moto-taxi") Linking.openURL("https://play.google.com/store/apps/details?id=com.moveit.app.customer"); // prettier-ignore
                    }

                    setShowInstruction(false);
                  }}
                  color={getColorByService(trip?.service)}
                >
                  Ilipat sa{" "}
                  {handleGetPlatformByService(trip.service) || "[App]"}
                </Cta>
              </View>
            </View>
          </View>
        </Optional>
        <Optional condition={showCancelationPrompt}>
          <CancelationPrompt
            onCancel={handleCancelFromCancelationPrompt}
            onProceed={handleConfirmFromCancelationPrompt}
            trip={trip}
          />
        </Optional>

        <Optional condition={showRequestTimeoutPrompt}>
          <TimeoutRequestPrompt
            trip={trip}
            onCancel={handleCancelFromRequestTimeoutPrompt}
            onProceed={handleConfirmFromRequestTimeoutPrompt}
          />
        </Optional>
      </View>
    </>
  );
}

/**
 *
 * @param {RequestedPreviewProps} props
 * @returns
 */
function RequestedPreview({
  onHandlerStateChange, //
  services = [],
  onChangeHeight,
}) {
  return (
    <Preview
      onChangeHeight={onChangeHeight}
      style={styles.previewContent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <GrayBar />
      <Text size={28} weight="bold" color="#353579">
        Looking for drivers
      </Text>
      <Text size={14} color="#707070">
        We are searching the best match for your request.
      </Text>
      <View style={styles.services}>
        <Optional condition={services?.includes("angkas")}>
          <View style={[styles.serviceChip, styles.angkas]}>
            <Text weight="bold" size={12} color="white">
              Passenger
            </Text>
          </View>
        </Optional>
        <Optional condition={services?.includes("mc-taxi")}>
          <View style={[styles.serviceChip, styles.joyRide]}>
            <Text weight="bold" size={12} color="white">
              MC Taxi
            </Text>
          </View>
        </Optional>
        <Optional condition={services?.includes("moto-taxi")}>
          <View style={[styles.serviceChip, styles.moveIt]}>
            <Text weight="bold" size={12} color="white">
              MotoTaxi
            </Text>
          </View>
        </Optional>
      </View>
    </Preview>
  );
}

/**
 *
 * @param {FoundPreviewProps} props
 * @returns
 */
function FoundPreview({
  eta,
  onMessage,
  onCall,
  first_name = "",
  last_name = "",
  image_url,
  vehicle_make,
  vehicle_model,
  vehicle_plate_number,
  vehicle_color,
  service,
  onChangeHeight,
}) {
  const platform = handleGetPlatformByService(service);
  const displayName = `${first_name} ${last_name}`.trim(); // prettier-ignore

  return (
    <Preview onChangeHeight={onChangeHeight} style={styles.previewContent}>
      <GrayBar />
      <Text size={28} weight="bold" color="#353579">
        On the way
      </Text>
      <View style={styles.driverInfoSubTitle}>
        <Text color="#707070">
          Your
          <Text weight="bold" color={getColorByService(service)}>
            {` ${platform} `}
          </Text>
          driver is on the way{" "}
        </Text>
        <Optional condition={Boolean(eta)}>
          <Text weight="bold" size={16} color={getColorByService(service)}>
            — Arrival {eta}
          </Text>
        </Optional>
      </View>

      <DriverInfo
        image_url={image_url}
        plate_number={vehicle_plate_number}
        display_name={displayName}
        onCall={onCall}
        onMessage={onMessage}
        showCallOption
        showChatOption
        model={vehicle_model}
        brand={vehicle_make}
        color={vehicle_color}
      />
    </Preview>
  );
}

function ArrivedPreview({
  onHandlerStateChange,
  onMessage,
  onCall,
  onTransfer,
  onChangeHeight,
  first_name = "",
  last_name = "",
  image_url,
  vehicle_make,
  vehicle_model,
  vehicle_plate_number,
  vehicle_color,
  platform,
  service,
}) {
  const isProfileLoading = false;
  // const { data: profile, isLoading: isProfileLoading } = useGetDriverProfile(profile_id); // prettier-ignore

  const displayName = `${first_name || ""} ${last_name || ""}`.trim(); // prettier-ignore

  return (
    <Preview
      onChangeHeight={onChangeHeight}
      style={styles.previewContent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <GrayBar />
      <PreviewTitle>Driver Arrived</PreviewTitle>

      <Text size={14} color="#707070">
        Your
        <Text weight="bold" size={14} color={getColorByService(service)}>
          {` ${handleGetPlatformByService(service) ?? ""} `}
        </Text>
        driver arrived to the pickup location
      </Text>

      <DriverInfo
        image_url={image_url}
        plate_number={vehicle_plate_number}
        display_name={displayName}
        onCall={onCall}
        onMessage={onMessage}
        showCallOption
        showChatOption
        model={vehicle_model}
        brand={vehicle_make}
        color={vehicle_color}
      />

      <View style={{ paddingTop: 16, backgroundColor: "#FFF" }}>
        <Cta onPress={() => onTransfer?.()} color={getColorByService(service)}>
          Transfer to {handleGetPlatformByService(service) || "App"}
        </Cta>
      </View>
    </Preview>
  );
}

function StartedPreview({
  id,
  onHandlerStateChange,
  eta,
  onTransfer,
  first_name = "",
  last_name = "",
  image_url,
  vehicle_make,
  vehicle_model,
  vehicle_plate_number,
  vehicle_color,
  platform,
  service,
  onChangeHeight = () => {},
}) {
  const displayName = `${first_name || ""} ${last_name || ""}`.trim(); // prettier-ignore

  const { isPending = false, mutate: handleArriveAtDestination } = useMutation({
    mutationFn: () => completeTrip(id),
  });

  return (
    <Preview
      onChangeHeight={onChangeHeight}
      style={styles.previewContent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <GrayBar />

      <PreviewTitle>On your way</PreviewTitle>

      <View style={styles.driverInfoSubTitle}>
        <Text size={14} color="#707070">
          Now heading to the destination
        </Text>
        <Optional condition={Boolean(eta)}>
          <Text weight="bold" size={14} color={getColorByService(service)}>
            {" "}
            — Arrival {eta}
          </Text>
        </Optional>
      </View>

      <DriverInfo
        image_url={image_url}
        plate_number={vehicle_plate_number}
        display_name={displayName}
        vehicle_make={vehicle_make}
        // showCallOption
        // showChatOption
        model={vehicle_model}
        brand={vehicle_make}
        color={vehicle_color}
      />

      <View style={{ paddingTop: 16, backgroundColor: "#FFF", gap: 8 }}>
        <Cta
          disabled={isPending}
          style={{ opacity: isPending ? 0.25 : 1 }}
          onPress={() => {
            Alert.alert(
              "Confirm trip arrival",
              "Doing this will complete your the trip. Do you want to continue this action?",
              [
                { text: "Close", style: "default", onPress: () => {} },
                {
                  text: "Confirm",
                  style: "destructive",
                  onPress: handleArriveAtDestination,
                },
              ]
            );
          }}
          color="transparent"
          textColor="#D1D5DB"
        >
          Arrived at Destination
        </Cta>

        <Cta onPress={() => onTransfer?.()} color={getColorByService(service)}>
          Transfer to {platform || "App"}
        </Cta>
      </View>
    </Preview>
  );
}

function DonePreview({
  onChangeHeight,
  first_name = "",
  last_name = "",
  image_url,
  vehicle_make,
  vehicle_model,
  vehicle_plate_number,
  vehicle_color,
  service,
}) {
  const displayName = `${first_name || ""} ${last_name || ""}`.trim(); // prettier-ignore

  return (
    <Preview style={styles.previewContent} onChangeHeight={onChangeHeight}>
      <PreviewTitle>Arrived</PreviewTitle>

      <Text size={14} color="#707070">
        You have arrived to the destination.
      </Text>

      <DriverInfo
        image_url={image_url}
        plate_number={vehicle_plate_number}
        display_name={displayName}
        vehicle_make={vehicle_make}
        model={vehicle_model}
        brand={vehicle_make}
        color={vehicle_color}
      />
    </Preview>
  );
}

function PreviewTitle({ children }) {
  return (
    <Text size={28} weight="bold" color="#353579">
      {children}
    </Text>
  );
}

function DriverInfo({
  image_url,
  plate_number,
  display_name,
  isLoading = false,
  onMessage,
  onCall,
  showCallOption,
  showChatOption,
  model = "",
  brand = "",
  color = "",
}) {
  let plateNumber, colorDisplay;

  if (plate_number) plateNumber = `[${plate_number}]`;
  if (color) colorDisplay = `- ${color}`;

  return (
    <View style={styles.driverInfoContainer}>
      <View style={styles.driverInfoRow}>
        <View style={styles.driverDetailsRow}>
          <View style={styles.driverImageContainer}>
            <Optional condition={isLoading === false}>
              <Image
                style={styles.driverImage}
                source={image_url}
                cachePolicy="memory-disk"
              />
            </Optional>
          </View>
          <View style={{ gap: 4, flex: 1 }}>
            <Optional condition={isLoading}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Skeleton height={14} width={50} colorMode="light" />
                <Skeleton height={14} width={75} colorMode="light" />
              </View>
              <Skeleton height={10} width={75} colorMode="light" />
            </Optional>
            <Optional condition={isLoading === false}>
              <Text numberOfLines={1} color="#363F59" size={18} weight="900">
                {`${brand} ${model} ${colorDisplay}`.trim()}
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Text size={14} weight="bold" color="#707070" numberOfLines={1}>
                  {plateNumber} {display_name}
                </Text>
              </View>
            </Optional>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 7, flexShrink: 0 }}>
          <Optional condition={showChatOption}>
            <TouchableOpacity onPress={onMessage}>
              <View style={styles.iconContainer}>
                <Image style={{ width: 22, height: 22 }} source={message} />
              </View>
            </TouchableOpacity>
          </Optional>
          <Optional condition={showCallOption}>
            <TouchableOpacity onPress={onCall}>
              <View style={styles.iconContainer}>
                <Image style={{ width: 22, height: 22 }} source={call} />
              </View>
            </TouchableOpacity>
          </Optional>
        </View>
      </View>
    </View>
  );
}

export function TransitPoints({
  first_point, //
  last_point,
  showShareRide,
  onShareRide,
}) {
  const isEnableRideShare = useFeatureIsOn("php-enable-share-ride", false);

  return (
    <View style={styles.transitContainer}>
      <View style={{ gap: 8 }}>
        <View style={styles.transitRow}>
          <Image
            style={styles.indicator}
            cachePolicy="memory-disk"
            source={from}
          />
          <Text weight="900" size={18} color="#1B1B1B">
            {first_point?.short_address}
          </Text>
        </View>
        <Text color="#707070">{first_point?.long_address}</Text>
      </View>
      <View style={{ gap: 8 }}>
        <View style={styles.transitRow}>
          <Image
            style={styles.indicator}
            cachePolicy="memory-disk"
            source={to}
          />
          <Text weight="900" size={18} color="#1B1B1B">
            {last_point?.short_address}
          </Text>
        </View>
        <Text color="#707070">{last_point?.long_address}</Text>
      </View>

      <Optional condition={isEnableRideShare}>
        <Optional condition={showShareRide}>
          <TouchableOpacity onPress={() => onShareRide?.()}>
            <View style={styles.shareRideRow}>
              <View style={styles.iconContainer}>
                <Image
                  style={{ height: 16, width: 18, resizeMode: "contain" }}
                  cachePolicy="memory-disk"
                  source={share}
                />
              </View>
              <Text size={18} weight="900" color="#10B981">
                Share this ride
              </Text>
            </View>
          </TouchableOpacity>
        </Optional>
      </Optional>
    </View>
  );
}

function FareDetails({
  estimatePreview,
  isCanceling,
  onCancel,
  showCancelOption,
  serviceCharge,
}) {
  const isEnableServiceCharge = useFeatureIsOn("php-enable-service-charge", false); // prettier-ignore

  return (
    <View style={styles.fareDetailsContainer}>
      <Optional condition={isEnableServiceCharge}>
        <View style={{ gap: 8 }}>
          <Text size={16} color="#707070">
            Service Charge
          </Text>
          <Optional condition={serviceCharge === 0}>
            <Text weight="bold" size={18} color="#10B981">
              Free
            </Text>
          </Optional>
          <Optional condition={serviceCharge > 0}>
            <Text weight="bold" size={18} color="#1B1B1B">
              {format(serviceCharge ?? 0)}
            </Text>
          </Optional>
        </View>
      </Optional>
      <View style={{ gap: 8, marginBottom: 16 }}>
        <Text size={16} color="#707070">
          Estimated Fare
        </Text>
        <Text weight="700" size={34} color="#353579">
          {estimatePreview ?? "₱ 0.00"}
        </Text>
      </View>
      <Text color="#707070" size={14}>
        This estimation is based on price regulated by LTFB. Estimated fare may
        vary in the actual trip in the application you chose.
      </Text>
      <Optional condition={showCancelOption}>
        <Cta
          disabled={isCanceling}
          onPress={onCancel}
          color={isCanceling ? "#f3f4f6" : "#D1D5DB"}
        >
          Cancel Request
        </Cta>
      </Optional>
    </View>
  );
}

function Feedback({ onClose, onSubmit }) {
  return (
    <View
      style={{
        position: "absolute",
        backgroundColor: "#00000029",
        height: "100%",
        width: "100%",
        zIndex: 5,
      }}
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <View style={styles.previewContent}>
          <Text size={28} weight="bold" color="#353579">
            You have arrived!
          </Text>

          <View style={{ marginVertical: 30, gap: 12 }}>
            <Text size={18} weight="bold" color="#1B1B1B">
              Tell us how was your trip?
            </Text>
            <Text size={14} color="#707070">
              Your feedback will help improve the app experience.
            </Text>
            <View
              style={{
                backgroundColor: "#F0F0F0",
                height: 81,
                borderRadius: 10,
                padding: 16,
              }}
            >
              <TextInput
                style={{ fontFamily: "Lato-Regular", fontSize: 16 }}
                placeholder="Give us a feed back"
                multiline
              />
            </View>
          </View>
          <Cta onPress={onClose} textColor="#353579" color="transparent">
            Not Now. Thank you!
          </Cta>
          <Cta onPress={onSubmit} color="#6366F1">
            Submit
          </Cta>
        </View>
      </View>
    </View>
  );
}

function DriverIcon({ id }) {
  const [locationString] = useMMKVString(`location.${id}`);
  const location = JSON.parse(locationString || "{}");

  if (
    !location?.payload?.latitude ||
    !location?.payload?.longitude ||
    !location?.payload?.heading
  ) {
    return null;
  }

  let driverIcon = "https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2Fmotor-angkas.png?alt=media&token=f30489fe-1495-41ec-8160-f048df15b602"; // prettier-ignore
  if (location?.platform === "JoyRide") driverIcon = "https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2Fmotor-joyride.png?alt=media&token=26f5ab6b-dc4d-4870-bb29-b04ea2c21096"; // prettier-ignore
  if (location?.platform === "Move It") driverIcon = "https://firebasestorage.googleapis.com/v0/b/pasahero-5c989.appspot.com/o/com.pasahero.passenger%2Fmotor-moveit.png?alt=media&token=adfb7d67-03bc-4213-b3cc-22270a331f91"; // prettier-ignore

  return (
    <Mapbox.MarkerView
      coordinate={[location.payload.longitude, location.payload.latitude]}
    >
      <Image
        cachePolicy="memory-disk"
        style={{
          width: 62,
          height: 62,
          transform: [{ rotate: `${location.payload.heading}deg` }],
        }}
        source={driverIcon}
      />
    </Mapbox.MarkerView>
  );
}

function GrayBar() {
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 16,
      }}
    >
      <TouchableOpacityGuesture>
        <View
          style={{
            width: 50,
            height: 5.5,
            borderRadius: 7,
            backgroundColor: "#E8E8E8",
            marginTop: -22,
          }}
        />
      </TouchableOpacityGuesture>
    </View>
  );
}

function CancelationPrompt({ trip, onProceed, onCancel }) {
  useEffect(() => {
    log.debug("Cancelation Prompt displayed");

    return () => {
      log.debug("Cancelation Prompt closed.");
      resetTrips();
    };
  }, []);

  return (
    <View style={styles.promptContainer}>
      <View style={styles.cancelationContent}>
        <View style={{ paddingHorizontal: 16, paddingTop: 32 }}>
          <Text size={28} weight="700" color="#353579">
            Driver Canceled
          </Text>

          <Text size={14} color="#707070">
            Do you want to continue this trip request?
          </Text>
        </View>

        <TransitPoints
          first_point={trip?.first_point}
          last_point={trip?.last_point}
        />

        <View
          style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 32 }}
        >
          <Cta
            onPress={() => onCancel?.()}
            color="transparent"
            textColor="#353579"
          >
            No. Thank you
          </Cta>

          <Cta onPress={() => onProceed?.()} color="#6366F1">
            Continue
          </Cta>
        </View>
      </View>
    </View>
  );
}

function TimeoutRequestPrompt({ trip, onProceed, onCancel }) {
  return (
    <View style={styles.promptContainer}>
      <View style={styles.cancelationContent}>
        <View style={{ paddingHorizontal: 16, paddingTop: 32 }}>
          <Text size={28} weight="700" color="#353579">
            No drivers nearby
          </Text>

          <Text size={14} color="#707070">
            Do you want to continue searching?
          </Text>
        </View>

        <TransitPoints
          first_point={trip?.first_point}
          last_point={trip?.last_point}
        />

        <View
          style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 32 }}
        >
          <Cta
            onPress={() => onCancel?.()}
            color="transparent"
            textColor="#353579"
          >
            No. Thank you
          </Cta>

          <Cta onPress={() => onProceed?.()} color="#6366F1">
            Continue
          </Cta>
        </View>
      </View>
    </View>
  );
}

/**
 * Use case: Changing the next booking pick up reference to the current drop-off
 * Anticipating that user will in the same location for the next booking
 *
 */
function handleChangePickupReference(coordinates) {
  log.debug("Changing pickup reference to current drop-off", { coordinates });
  storage.set(
    "location.current",
    JSON.stringify({
      ...(coordinates || {}),
      shortAddress: coordinates?.short_address,
      longAddress: coordinates?.long_address,
    })
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  scrollView: {
    flex: 1,
    overflow: "visible",
  },
  previewContent: {
    backgroundColor: "white",
    paddingHorizontal: 18,
    paddingVertical: 34,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
  },
  map: {
    height: "100%",
    width: "100%",
    flex: 1,
  },
  heading: {
    flexDirection: "row",
    marginTop: 16,
  },
  button: {
    backgroundColor: "gainsboro",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  services: {
    flexDirection: "row",
    marginTop: 16,
    gap: 5,
  },
  serviceContainer: {
    height: 24,
    width: 24,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    height: 24,
    width: 24,
  },
  marker: { width: 48, height: 48, marginBottom: 24 },
  indicator: { width: 12, height: 12, marginTop: 4 },
  driverInfoSubTitle: {
    flexDirection: "row",
  },
  driverInfoContainer: {
    paddingTop: 16,
    marginTop: 16,
    borderColor: "#EAEAEA",
    borderTopWidth: 1,
  },
  driverInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  driverDetailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  driverImageContainer: {
    width: 55,
    height: 55,
    backgroundColor: "#f3f4f6",
    borderRadius: 9,
    overflow: "hidden",
  },
  driverImage: {
    width: "100%",
    height: "100%",
  },
  iconContainer: {
    backgroundColor: "#EFEFEF",
    height: 40,
    width: 40,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  transitContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 16,
  },
  transitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  shareRideRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  fareDetailsContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 32,
    gap: 16,
  },
  promptContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    position: "absolute",
    justifyContent: "flex-end",
    backgroundColor: "#00000032",
    zIndex: 5,
  },
  cancelationContent: {
    backgroundColor: "white",
  },
  serviceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  angkas: { backgroundColor: "#0090F9" },
  joyRide: { backgroundColor: "#181ACA" },
  moveIt: { backgroundColor: "#EF4444" },
});

function DoneMap({ destination }) {
  const featureCollection = {
    type: "FeatureCollection",
    features: [],
  };

  if (destination) {
    const point = turf.point([destination?.longitude, destination?.latitude], {
      id: "destination",
    });

    featureCollection.features.push(point);
  }

  return (
    <Mapbox.ShapeSource id="arrive-source" shape={featureCollection}>
      <Mapbox.SymbolLayer
        id="destination"
        style={{
          iconImage: "last",
          iconSize: 0.147,
          iconAllowOverlap: true,
          iconAnchor: "center",
        }}
        filter={["==", ["get", "id"], "destination"]}
      />

      {location && (
        <Mapbox.Camera
          pitch={45}
          centerCoordinate={[destination?.longitude, destination?.latitude]}
          zoomLevel={17}
        />
      )}
    </Mapbox.ShapeSource>
  );
}

function ArrivedMap({ driver_id, pickup }) {
  const [location, setState] = useState();

  const featureCollection = {
    type: "FeatureCollection",
    features: [],
  };

  useEffect(() => {
    // get location
    getLocation(driver_id).then((data) => {
      if (data) setState(data);
    });

    // subscribe to the driver location updates
    const unsubscribe = subscribe(`locations.${driver_id}`, (data) => {
      setState(data);
    });

    return () => unsubscribe?.();
  }, []);

  if (location) {
    const point = turf.point([location?.longitude, location?.latitude], {
      rotation: location?.heading,
      id: "driver",
    });

    featureCollection.features.push(point);
  }

  if (pickup) {
    const point = turf.point([pickup?.longitude, pickup?.latitude], {
      id: "destination",
    });

    featureCollection.features.push(point);
  }

  return (
    <Mapbox.ShapeSource id="arrive-source" shape={featureCollection}>
      <Mapbox.SymbolLayer
        id="point-driver"
        style={{
          iconImage: "driverIcon",
          iconAllowOverlap: true,
          iconRotate: ["get", "rotation"],
          iconRotationAlignment: "map",
          iconSize: 0.147,
          iconAnchor: "center",
        }}
        filter={["==", ["get", "id"], "driver"]}
      />

      <Mapbox.SymbolLayer
        id="destination"
        style={{
          iconImage: "first",
          iconSize: 0.147,
          iconAllowOverlap: true,
          iconAnchor: "center",
        }}
        filter={["==", ["get", "id"], "destination"]}
      />

      {location && (
        <Mapbox.Camera
          centerCoordinate={[location?.longitude, location?.latitude]}
          followHeading={location.heading}
          heading={location.heading}
          zoomLevel={17}
          pitch={45}
        />
      )}
    </Mapbox.ShapeSource>
  );
}

function Route({ id, location, service, setEta, destinationMarker }) {
  useRenderCounter("OnTheWayRoute");

  const [origin, setOrigin] = useState();
  const [destination, setDestination] = useState();
  const [lineString, setLineString] = useState();
  const [boundingBox, setBoundingBox] = useState();

  useEffect(() => {
    const track = new Track(id, location);

    track.on("update", (data) => {
      setDestination(data.destination);
      setEta(data.eta);

      const driverLocation = data.location;

      const distance = getDistance(
        driverLocation?.latitude,
        driverLocation?.longitude,
        location?.latitude,
        location?.longitude
      );

      // show route if distance is greater than 0.3 km (300 meters)
      if (distance > 0.3) {
        setLineString(data.lineString);
        setOrigin(data.origin);
        setBoundingBox(getBoundingBox(data.coordinates));
      } else {
        // otherwise, use the real time driver location
        setOrigin(
          turf.point([data.location?.longitude, data.location?.latitude], {
            rotation: data.location?.heading,
          })
        );

        setLineString();
        setBoundingBox();
      }
    });

    return () => {
      track.close();
    };
  }, []);

  const featureCollection = {
    type: "FeatureCollection",
    features: [],
  };

  if (lineString) featureCollection.features.push(lineString);

  if (origin) {
    origin.properties.id = "origin";
    featureCollection.features.push(origin);
  }

  if (destination) {
    destination.properties.id = "destination";
    featureCollection.features.push(destination);
  }

  return (
    <>
      <Optional
        fallback={
          <Mapbox.Camera
            centerCoordinate={origin?.geometry?.coordinates}
            followHeading={origin?.properties?.rotation}
            heading={origin?.properties?.rotation}
            zoomLevel={17}
            pitch={45}
          />
        }
        condition={boundingBox}
      >
        <Mapbox.Camera pitch={45} animationMode="flyTo" bounds={boundingBox} />
      </Optional>

      <Mapbox.ShapeSource id="route" shape={featureCollection}>
        <Mapbox.LineLayer
          id="stroke"
          style={{
            lineColor: getColorByService(service),
            lineWidth: 6.5,
            lineCap: "round",
            lineJoin: "round",
          }}
          filter={["==", "$type", "LineString"]}
        />

        <Mapbox.SymbolLayer
          id="point-destination"
          style={{
            iconImage: destinationMarker,
            iconSize: 0.147,
            iconAllowOverlap: true,
            iconAnchor: "center",
          }}
          filter={["==", ["get", "id"], "destination"]}
        />

        <Mapbox.SymbolLayer
          id="point-origin"
          style={{
            iconImage: "driverIcon",
            iconAllowOverlap: true,
            iconRotate: ["get", "rotation"],
            iconRotationAlignment: "map",
            iconSize: 0.147,
            iconAnchor: "center",
          }}
          filter={["==", ["get", "id"], "origin"]}
        />
      </Mapbox.ShapeSource>
    </>
  );
}

function getBoundingBox(coordinates) {
  if (!coordinates) return;

  const bBox = calculateBoundingBox(coordinates);

  return {
    ne: bBox[1],
    sw: bBox[0],
    paddingTop: 48,
    paddingLeft: 48,
    paddingRight: 48,
    paddingBottom: 48,
  };
}
