import { createClient } from "@supabase/supabase-js";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!process.env.SUPABASE_URL || !serviceRoleKey) {
	throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in server environment");
}

const supabase = createClient(process.env.SUPABASE_URL, serviceRoleKey);

const requireAuth = async (req, res, next) => {
	const authHeader = req.headers.authorization || "";
	const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

	if (!token) {
		return res.status(401).json({ error: "Missing or invalid Authorization header" });
	}

	try {
		// Verify the token using Supabase server-side client
		const result = await supabase.auth.getUser(token);
		const user = result?.data?.user;
		const error = result?.error;

		if (error || !user) {
			return res.status(401).json({ error: "Invalid or expired token" });
		}

		req.user = {
			id: user.id,
			email: user.email || null,
		};

		return next();
	} catch (err) {
		return res.status(401).json({ error: "Invalid or expired token" });
	}
};

export default requireAuth;
