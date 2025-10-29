import app from "../src/app";

export default function handler(req: any, res: any) {
  if (req.url && !req.url.startsWith("/api")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }
  return (app as any)(req, res);
}