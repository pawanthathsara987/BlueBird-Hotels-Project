import { AirPortPickup, Customer, Booking } from "../../models/index.js";

const getAirportPickupRequests = async (req, res) => {
  try {
    const requests = await AirPortPickup.findAll({
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: Customer,
              attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
            }
          ]
        },
      ],
      order: [
        ["pickup_date", "ASC"],
        ["pickup_time", "ASC"],
      ],
    });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch airport pickup requests",
      error: error.message,
    });
  }
};

export { getAirportPickupRequests };
