import { Request, RequestHandler } from "express";

type RateLimitOptions = {
    name: string;
    windowMs: number;
    max: number;
};

type RateLimitBucket = {
    count: number;
    resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

function getClientIp(req: Request): string {
    const forwardedFor = req.headers["x-forwarded-for"];
    if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
        return forwardedFor.split(",")[0].trim();
    }

    return req.ip || req.socket.remoteAddress || "unknown";
}

export function createRateLimitMiddleware(options: RateLimitOptions): RequestHandler {
    return (req, res, next) => {
        const now = Date.now();
        const key = `${options.name}:${getClientIp(req)}`;

        const bucket = buckets.get(key);
        if (bucket == null || now >= bucket.resetAt) {
            buckets.set(key, {
                count: 1,
                resetAt: now + options.windowMs
            });
            next();
            return;
        }

        bucket.count += 1;
        if (bucket.count > options.max) {
            const retryAfterSeconds = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
            res.setHeader("Retry-After", retryAfterSeconds.toString());
            res.status(429).json({
                status: "error",
                message: "Too many requests"
            });
            return;
        }

        next();
    };
}