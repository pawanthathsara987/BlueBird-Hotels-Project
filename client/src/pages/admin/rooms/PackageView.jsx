import { Plus } from "lucide-react";
import { RiDeleteBinLine, RiEditLine } from "react-icons/ri";

const PackageView = ({ onOpenModal }) => {
    const Packages = [
        {
            id: 1,
            pname: "Summer Special",
            pprice: 299,
            pimage: "https://placehold.co/100?text=Pkg1",
            maxAdults: 2,
            maxKids: 1
        },
        {
            id: 2,
            pname: "Family Getaway",
            pprice: 499,
            pimage: "https://placehold.co/100?text=Pkg2",
            maxAdults: 4,
            maxKids: 2
        }
    ];

    return (
        <div className="mt-10 mx-5 rounded-lg">
            <div 
                className="w-fit m-2 ml-auto flex items-center justify-between p-2 
                    text-md rounded-[5px] space-x-1 bg-blue-400 shadow-md"

                onClick={onOpenModal}
            >
                <Plus />
                <label>Add Package</label>
            </div>
            <table className="min-w-full bg-white shadow-md rounded-lg">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="px-4 py-2">Package Name</th>
                        <th className="px-4 py-2">Price</th>
                        <th className="px-4 py-2">Adults</th>
                        <th className="px-4 py-2">Kids</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Packages.map(pkg => (
                        <tr key={pkg.id} className="text-center">
                            <td className="px-4 py-2 flex items-center gap-2">
                                {pkg.pimage && <img src={pkg.pimage} alt="" className="w-10 h-10 rounded" />}
                                {pkg.pname}
                            </td>
                            <td className="px-4 py-2">${pkg.pprice}</td>
                            <td className="px-4 py-2">{pkg.maxAdults}</td>
                            <td className="px-4 py-2">{pkg.maxKids}</td>
                            <td className="px-4 py-2 flex justify-center items-center space-x-5">
                                <RiEditLine className="text-blue-500 hover:text-blue-700"/>
                                <RiDeleteBinLine className="text-red-500 hover:text-red-700"/>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PackageView;