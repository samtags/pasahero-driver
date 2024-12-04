import { createClient } from "@supabase/supabase-js";
import Const from "expo-constants";

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

export default supabase;
