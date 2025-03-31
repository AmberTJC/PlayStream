import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pyiechuhgtbzjauqreyu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5aWVjaHVoZ3RiemphdXFyZXl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNDI1MDQsImV4cCI6MjA1ODYxODUwNH0.FLhC_vFzs6u8cg9yGk0kQRjfr35GlMU0wmHX-5EKn7Q';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
