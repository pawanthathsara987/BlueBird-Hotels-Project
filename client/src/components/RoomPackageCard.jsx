export default function RoomPackageCard({
    image,
    title,
    price,
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

                        <p className="text-4xl text-gray-400">
                            from ${price}
                        </p>

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