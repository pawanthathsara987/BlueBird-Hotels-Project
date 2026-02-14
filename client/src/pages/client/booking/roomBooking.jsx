import { Bed, BedDouble, UserCheck } from 'lucide-react';
import { FaHome, FaRestroom, FaStar, FaUser, FaUserFriends, } from 'react-icons/fa';


export default function BookingRoom() {

    const rooms = [
    {
        id: 1,
        type: "Deluxe Double Room",
        adults: 2,
        kids: 0,
        price: 156,
        quantity: 8,
    },
    {
        id: 2,
        type: "Double Room with Balcony",
        adults: 0,
        kids: 0,
        price: 175,
        quantity: 0,
    },
    {
        id: 3,
        type: "Superior Family Room",
        adults: 2,
        kids: 2,
        price: 196,
        quantity: 2,
    },
    ];


    return (
        <div className="w-full m-10 cursor-default">

            {/* header */}
            <div className="w-full flex flex-wrap justify-center text-center">
                <h1 className="w-full text-3xl font-mono">ROOM ASSIGNMENT FOR YOUR GROUP</h1>
                <p className="w-full">Automatically assign rooms for you by system</p>
            </div>

            {/* asign adults, children, room block */}
            <div className="w-[60%] flex justify-between m-auto mt-10">
                <div className="border-2 px-7 py-3 flex justify-between gap-2 items-center">
                    <FaUserFriends />
                    <span></span> Adults
                </div>
                <div className="border-2 px-7 py-3 flex justify-between gap-2 items-center">
                    <FaUser />
                    <span></span> Children
                </div>
                <div className="border-2 px-7 py-3 flex justify-between gap-2 items-center">
                    <FaHome />
                    <span></span> Rooms
                </div> 
            </div>

            {/* system recommanded room block */}
            <div className="w-[60%] border-2 m-auto mt-10 h-fit">
                <div className='w-full flex items-center gap-2 mb-4 px-5 mt-5'>
                    <FaStar className='text-yellow-500'/>
                    <p>
                        Recommended for your group
                    </p>
                </div>
                <div className='w-full flex items-center gap-2 px-5'>
                    <BedDouble className='text-black'/>
                    <span>8</span> Double Room
                </div>
                <div className='w-full flex items-center gap-2 px-5'>
                    <Bed className='text-black'/>
                    <span>3</span> Family Room
                </div>
                <div className='w-full border-t-2 mt-5 flex justify-between items-center-safe px-5 py-2'>
                    <div className='flex gap-2 font-bold '>
                        <span>11</span>
                        <p>Rooms Total Price: </p>
                        <span>$196</span>
                    </div>
                    <button className='px-5 py-2 rounded-2xl bg-blue-700 text-white font-bold shadow-md cursor-pointer'>
                        Customize Rooms
                    </button>
                </div>
            </div>

            {/* room customize block */}
            <div className='w-[80%] mt-10 m-auto'>
                <div className='flex items-center gap-2'>
                    <UserCheck /> Room Assignment
                </div>
                <div className='w-full mt-3'>
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-100">
                            <tr>
                            <th className="p-3 text-left">Room Type</th>
                            <th className="p-3">Adults</th>
                            <th className="p-3">Kids</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Rooms</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-300">
                            {rooms.map((room) => (
                            <tr key={room.id}>
                                <td className="p-3">{room.type}</td>
                                <td className="p-3 text-center">{room.adults}</td>
                                <td className="p-3 text-center">{room.kids}</td>
                                <td className="p-3 text-center">${room.price}</td>
                                <td className="p-3 text-center">
                                    <div className='w-[80%] m-auto flex items-center justify-between border-2 rounded-[10px]'>
                                        <button className='border-r-2 px-3 p-0.5 cursor-pointer'>-</button>
                                        <span className='text-center'>{room.quantity}</span>
                                        <button className='border-l-2 px-3 p-0.5 cursor-pointer'>+</button>
                                    </div>
                                </td>
                            </tr>
                            ))}
                            <tr className="border-b font-semibold">
                                <td colSpan={5} className="p-3 text-center">
                                    Total: <span>10</span> Rooms | $<span>3150</span>
                                </td>
                            </tr>
                        </tbody>
                        </table>

                        <button className='w-full mt-5 text-white text-center font-bold bg-blue-800 rounded-[5px]'>
                            Continue
                        </button>
                </div>
            </div>

        </div>
        
    );
}   