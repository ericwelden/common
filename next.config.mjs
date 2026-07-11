/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: import.meta.dirname,
  },
  experimental: {
    serverActions: {
      // Next.js caps Server Action request bodies at 1MB by default, well
      // under the 5MB item-photos/profile-photos Storage bucket limits --
      // any real phone photo blows past 1MB, so uploads were silently
      // rejected before createItem/updateProfile ever ran. A bit of
      // headroom above 5MB accounts for multipart form encoding overhead,
      // so Supabase's own limit (with a real error message) is what
      // actually applies, not Next.js's framework-level cutoff.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
