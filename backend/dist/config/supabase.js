"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupabaseUserClient = exports.supabaseAdmin = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is not set in .env. Admin operations (like webhooks) will fail RLS.');
}
// We use the Service Role Key in the backend to bypass RLS for administrative tasks
// Note: When acting on behalf of a user, we can pass their JWT to a separate client instance.
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
/**
 * Helper to create a user-scoped Supabase client using their JWT token
 */
const createSupabaseUserClient = (token) => {
    return (0, supabase_js_1.createClient)(supabaseUrl, process.env.SUPABASE_ANON_KEY || '', {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    });
};
exports.createSupabaseUserClient = createSupabaseUserClient;
