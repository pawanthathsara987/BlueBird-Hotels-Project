export const getSubdomain = () => {
    const hostname = window.location.hostname;
    
    // Developer query param override (e.g. localhost:5173?subdomain=admin)
    const urlParams = new URLSearchParams(window.location.search);
    const mockSubdomain = urlParams.get("subdomain");
    if (mockSubdomain) return mockSubdomain;
    
    const parts = hostname.split('.');
    
    // Check if it's localhost (e.g., admin.localhost)
    if (hostname.endsWith("localhost") || hostname === "127.0.0.1") {
        if (parts.length > 1 && hostname !== "127.0.0.1") {
            return parts[0];
        }
        return null;
    }
    
    // Production / staging domains (e.g., admin.bluebirdhotels.lk)
    if (parts.length > 2) {
        return parts[0];
    }
    
    return null;
};

export const getSubdomainUrl = (subdomain, path = "") => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port ? `:${window.location.port}` : "";
    
    // Localhost handling
    if (hostname.endsWith("localhost") || hostname === "127.0.0.1") {
        if (subdomain) {
            // E.g., http://admin.localhost:5173/admin
            return `${protocol}//${subdomain}.localhost${port}${path}`;
        }
        return `${protocol}//localhost${port}${path}`;
    }
    
    // Production handling
    const baseDomain = "bluebirdhotels.lk";
    if (subdomain) {
        return `${protocol}//${subdomain}.${baseDomain}${port}${path}`;
    }
    return `${protocol}//booking.${baseDomain}${port}${path}`;
};
