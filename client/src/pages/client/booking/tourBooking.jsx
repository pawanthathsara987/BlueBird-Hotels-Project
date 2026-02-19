import { useState } from "react";


export default function BookingTour() {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contact: '',
        nationality: '',
        adults: '',
        children: '',
        startDate: '',
        pickupLocation: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log(formData);
    };



    return (
        <div className="w-full  ">
            {/*hero section*/}
            <div className="relative h-[400px] ">
                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e" alt="Tour" 
                className="w-full h-full object-cover" />

                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <h1 className="text-white text-4xl font-bold md:text-5xl">Negombo Lagoon Tour</h1>
                </div>
            </div>
    
        
            {/* overview + side card */}
            <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
                {/* Left Section */}
                <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Overview</h2>

                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Negombo, Sri Lanka, the second-largest city in the Western Province after Colombo,
                            is a lively town near the Bandaranaike International Airport. Negombo, which sits near
                            the mouth of the lagoon, is a popular tourist destination with a longstanding,
                            significant, and prosperous fishing industry.

                            <br /><br />

                            This beach is calm and serene, and it’s particularly endearing to see the local fishermen
                            out at sea in their oruwas (canoes). Although swimming is not usually advisable here,
                            divers can investigate the debris of a British cargo plane from World War II in Marawila,
                            a nearby city.

                            <br /><br />

                            You can find monitor lizards and flocks of migrating birds on a boat tour that winds
                            through the beautiful mangroves of the Dutch Canal or Muthurajawela Marsh.
                        </p>

                    {/* Itinerary Section */}
                        <h3 className="text-lg font-semibold mt-6 mb-3">
                            Itinerary For 2 Hours
                        </h3>

                        <ul className="list-disc pl-6 text-gray-600 space-y-2">
                            <li>Fish Market Visit</li>
                            <li>Mangroves Exploration</li>
                            <li>Monkey Island Stop</li>
                            <li>Special Treats – Fruits & Drinks</li>
                        </ul>
                </div>


                {/* Right card */}
                <div className="bg-gray-200 p-6 space-y-6">

                    {/* Package Price */}
                    <div>
                        <div className="bg-blue-700 text-white text-center py-4 font-semibold uppercase tracking-wide">
                        Package Price
                        </div>

                        <div className="bg-white p-6 text-center">
                        <h3 className="text-3xl font-bold text-blue-700">$120</h3>
                        
                        </div>
                    </div>

                    {/* Inquiry */}
                    <div className="bg-blue-50 text-black text-center py-6">
                        <p className="font-semibold mb-4">Interested?</p>
                        <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 transition">
                        Click here to send an inquiry
                        </button>
                    </div>

                    {/* Map */}
                    <div>
                        <iframe
                        src="https://www.google.com/maps?q=Negombo,SriLanka&output=embed"
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        ></iframe>
                    </div>

                </div>


            </div>


            {/* image + inclution*/}
            <div className="max-w-6xl mx-auto px-6 pb-16 grid md:grid-cols-2 gap-10">

                <div className="w-full h-[380px] overflow-hidden ">
                    <img
                        src="https://images.unsplash.com/photo-1500375592092-40eb2168fd21"
                        alt="lagoon"
                        className="w-full h-full object-cover border-4 border-gray-300 rounded-lg transform transition-transform duration-300 hover:scale-105"
                    />
                </div>

                    <div>
                        <h3 className="text-xl font-semibold mb-3">Inclusions</h3>
                        <ul className="list-disc ml-6 text-gray-600 space-y-2">
                            <li>A/C Vehicle (Car,Van,Bus)</li>
                            <li>Professional Driver</li>
                            <li>Boat Ride</li>
                            <li>Refreshments</li>
                        </ul>


                        <h3 className="text-xl font-semibold mb-3 mt-6">Cancellation Policy</h3>
                        <ul className="list-disc ml-6 text-gray-600">
                            <li>Cancellations made 48 hours before the tour start time are fully refundable.</li>
                            <li>No refunds are given for cancellations made less than 48 hours before the tour start time.</li>
                        </ul>
                    </div>
            </div>



            { /* Booking Form Section */}
            <div className="bg-[#3380d2] text-white rounded-2xl shadow-xl py-20">
                <div className="max-w-7xl mx-auto px-1">
                    <h2 className=" text-center text-4xl font-bold mb-6">
                        Start Planning Your Tour
                    </h2>

                    {/* Description */}
                        <p className="text-center text-sm max-w-3xl mx-auto mb-16 leading-relaxed">
                        Please give as much information as you could so that we can get a good idea 
                        about your requirements. Our business development team will send you 
                        the best quote within 48 hours.
                        </p>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="grid md:grid-cols-2 gap-10">

                            {/* LEFT SIDE */}

                            <div className="space-y-8">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-3.5 rounded-lg text-black bg-amber-50"
                                    required
                                />

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-3.5 rounded-lg text-black bg-amber-50"
                                    required
                                />

                                <div className="grid grid-cols-2 gap-8">
                                    <input
                                        type="text"
                                        name="contact"
                                        placeholder="Contact"
                                        value={formData.contact}
                                        onChange={handleChange}
                                        className="p-3.5 rounded-lg text-black bg-amber-50"
                                    />

                                    <input
                                        type="text"
                                        name="nationality"
                                        placeholder="Nationality"
                                        value={formData.nationality}
                                        onChange={handleChange}
                                        className="p-3.5 rounded-lg text-black bg-amber-50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    

                                    <input
                                        type="number"
                                        name="adults"
                                        placeholder="Adults"
                                        min="1"
                                        value={formData.adults}
                                        onChange={handleChange}
                                        className="p-3.5 rounded-lg text-black bg-amber-50"
                                    />
                                

                                <input
                                        type="number"
                                        name="children"
                                        placeholder="Children"
                                        min="0"
                                        value={formData.children}
                                        onChange={handleChange}
                                        className="p-3.5 rounded-lg text-black bg-amber-50"
                                    />
                                
                                </div>
                            </div>



                            {/* RIGHT SIDE */}
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-4">

                                    <input
                                        type="date"
                                        name="startDate"
                                        placeholder="Start Date"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        className="p-3.5 rounded-lg text-black bg-amber-50"
                                    />

                                    <input
                                        type="date"
                                        name="endDate"
                                        placeholder="End Date"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        className="p-3.5 rounded-lg text-black bg-amber-50"
                                    />

                                </div>
                                

                                <textarea
                                    name="message"
                                    placeholder="Message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full p-3.5 rounded-lg text-black bg-amber-50"
                                    rows="8"
                                ></textarea> 
                            </div>
                        </div>        

                        <div className="text-center mt-16">
                            <button type="submit" className="bg-[#345F8C] hover:bg-[#2c5177]
                                    text-white font-medium
                                    px-12 py-3
                                    rounded-md
                                    transition-colors duration-200 ">
                                Submit Booking
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
        
    );

}

