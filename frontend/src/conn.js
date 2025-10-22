import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://yycapedsxlwcqwsxfipk.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5Y2FwZWRzeGx3Y3F3c3hmaXBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNTI1NjQsImV4cCI6MjA3NjYyODU2NH0.dBp5hHJWHrnNATxnOltKqmLVu47_DH5LqiTAacpTCgI"
export const supabase = createClient(supabaseUrl,supabaseKey);