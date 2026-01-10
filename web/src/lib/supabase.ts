import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://klmwlfckrqbtpnwyyigm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsbXdsZmNrcnFidHBud3l5aWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMDA4NzYsImV4cCI6MjA4MzU3Njg3Nn0.3Zf5npWfv2oy82-jRI0e-_gh59fB4Kn5M0QcdvQS8wI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
