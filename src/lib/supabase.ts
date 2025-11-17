import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = 'https://fnhatrkillucjgqxzidb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuaGF0cmtpbGx1Y2pncXh6aWRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NDA5MjUsImV4cCI6MjA1MzExNjkyNX0.8H9ocqJEIOIUJy68qY3rPfdW1WQyLgYjigy48mEglmM';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);