export default function RoomPackageCard({
    image,
    title,
    price,
    originalPrice,
    discount,
    adults,
    kids,
    description,
}) {
    return (
        <div className="h-175 bg-neutral-50 rounded-2xl overflow-hidden flex flex-col">

            {/* Image */}
            <img
                src={image}
                alt={title}
                className="h-90 w-full shrink-0 object-cover"
            />

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col gap-3">

                <div className="flex items-start justify-between gap-4">

                    <h2 className="max-w-50 text-3xl leading-tight text-black/70">
                        {title}
                    </h2>

                    <div className="text-right">
                        {Number(discount || 0) > 0 && Number(originalPrice || 0) > Number(price || 0) && (
                            <p className="text-sm text-gray-400 line-through">
                                ${Number(originalPrice || 0).toFixed(2)}
                            </p>
                        )}

                        <p className="text-4xl text-gray-400">
                            from ${Number(price || 0).toFixed(2)}
                        </p>
                        {Number(discount || 0) > 0 && (
                            <p className="mt-1 text-xs font-semibold text-emerald-700">
                                {discount}% OFF
                            </p>
                        )}

                    </div>

                </div>

                <p className="text-gray-400 text-[15px]">
                    {adults} Adults • {kids} Kids
                </p>

                <p className="text-[17px] leading-7 text-gray-600">
                    {description}
                </p>

            </div>

        </div>
    );
}