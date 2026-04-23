export default function Loader({
    size = "h-10 w-10",
    color = "border-blue-500",
    fullScreen = false
}) {
    return (
        <div className={fullScreen ? "flex justify-center items-center h-screen" : "flex justify-center items-center"}>
            <div className={`animate-spin rounded-full ${size} border-b-2 ${color}`}></div>
        </div>
    );
}