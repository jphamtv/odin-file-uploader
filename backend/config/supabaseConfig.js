// backend/config/supabaseConfig.js
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  throw new Error("Missing Supabase credentials in environment variables");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false, // Since app is set up with its own auth system
    },
  }
);

// Test the connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    console.log("✅ Supabase storage connection successful");
  } catch (error) {
    console.error("❌ Supabase storage connection failed:", error.message);
  }
};

// Run test when app starts
testConnection();

module.exports = supabase;
