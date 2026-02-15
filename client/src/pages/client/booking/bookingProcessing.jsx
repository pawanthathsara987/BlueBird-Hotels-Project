import { Calendar, Clock, Home, Users, Smile, CreditCard, Mail, MapPin, Phone, User } from "lucide-react";
import Select from "react-select";
import countryList from "react-select-country-list";
import React, { useMemo, useState } from "react";

export default function BookingProcess() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const options = useMemo(() => countryList().getData(), []);

  // Guest info state
  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
  });

  // Payment info state
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  // Step progress data
  const steps = [
    { number: 1, title: "Guest Information" },
    { number: 2, title: "Payment Details" },
    { number: 3, title: "Review & Confirm" },
  ];

  // Validation
  const isFormValid =
    guestInfo.firstName &&
    guestInfo.lastName &&
    guestInfo.email &&
    guestInfo.phone &&
    guestInfo.country &&
    paymentInfo.cardNumber &&
    paymentInfo.cardName &&
    paymentInfo.expiryDate &&
    paymentInfo.cvv;

  // Card formatting
  const handleCardChange = (e) => {
    let value = e.target.value.replace(/\s+/g, "");
    value = value.replace(/[^0-9]/gi, "").substring(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(" ") || "";
    setPaymentInfo({ ...paymentInfo, cardNumber: formatted });
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (value.length >= 3) value = value.slice(0, 2) + "/" + value.slice(2);
    setPaymentInfo({ ...paymentInfo, expiryDate: value });
  };

  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 3);
    setPaymentInfo({ ...paymentInfo, cvv: value });
  };

  const handleConfirmBooking = () => {
    if (!isFormValid) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Booking Confirmed ✅");
    }, 2000);
  };

  return (
    <div className="m-0 p-10 min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="w-[90%] m-auto text-center mb-10">
        <h1 className="text-4xl font-bold mb-3">Complete Your Booking</h1>
        <p>Just a few steps to confirm your reservation</p>
      </div>

      {/* Step Indicator */}
      <div className="w-[90%] m-auto flex justify-center items-center mb-10">
        {steps.map((step, index) => (
          <div className="flex items-center" key={step.number}>
            <div className="text-center">
              <div
                className={`rounded-full w-12 h-12 flex justify-center items-center ${
                  currentStep >= step.number ? "bg-blue-600 text-white" : "bg-gray-200"
                } font-bold`}
              >
                {step.number}
              </div>
              <span className="font-medium text-[12px]">{step.title}</span>
            </div>
            {index !== steps.length - 1 && (
              <div
                className={`w-24 h-1 mx-5 ${
                  currentStep > step.number ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="w-[90%] m-auto mt-10 flex justify-between md:flex-wrap gap-6">
        {/* Left Panel */}
        <div className="w-[65%] p-5 rounded-2xl bg-white shadow-2xl">
          {/* Step 1: Guest Info */}
          {currentStep === 1 && (
            <>
              <h2 className="text-2xl font-bold mb-5">Guest Information</h2>
              <div className="flex justify-between items-center gap-4">
                <div className="w-[48%]">
                  <label>First Name *</label>
                  <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-2">
                    <User />
                    <input
                      type="text"
                      placeholder="John"
                      className="w-full outline-0 px-2"
                      value={guestInfo.firstName}
                      onChange={(e) =>
                        setGuestInfo({ ...guestInfo, firstName: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="w-[48%]">
                  <label>Last Name *</label>
                  <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-2">
                    <User />
                    <input
                      type="text"
                      placeholder="Doe"
                      className="w-full outline-0 px-2"
                      value={guestInfo.lastName}
                      onChange={(e) =>
                        setGuestInfo({ ...guestInfo, lastName: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <label>Email *</label>
                <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-2">
                  <Mail />
                  <input
                    type="email"
                    placeholder="johndoe@gmail.com"
                    className="w-full outline-0 px-2"
                    value={guestInfo.email}
                    onChange={(e) =>
                      setGuestInfo({ ...guestInfo, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mt-5">
                <label>Mobile Number *</label>
                <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-2">
                  <Phone />
                  <input
                    type="text"
                    placeholder="+94 765245564"
                    className="w-full outline-0 px-2"
                    value={guestInfo.phone}
                    onChange={(e) =>
                      setGuestInfo({ ...guestInfo, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="mt-5">
                <label>Country *</label>
                <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-2">
                  <MapPin />
                  <Select
                    options={options}
                    placeholder="Select Country"
                    className="w-full"
                    styles={{
                      control: (base) => ({
                        ...base,
                        border: "none",
                        boxShadow: "none",
                        outline: "none",
                        backgroundColor: "transparent",
                      }),
                    }}
                    value={options.find((o) => o.label === guestInfo.country)}
                    onChange={(selected) =>
                      setGuestInfo({ ...guestInfo, country: selected.label })
                    }
                  />
                </div>
              </div>

              <button
                className="mt-5 w-full bg-blue-600 text-white py-3 rounded-2xl hover:bg-blue-700"
                onClick={() => setCurrentStep(2)}
              >
                Continue to Payment →
              </button>
            </>
          )}

          {/* Step 2: Payment Info */}
          {currentStep === 2 && (
            <>
              <h2 className="text-2xl font-bold mb-5">Payment Information</h2>

              <div className="mt-5">
                <label>Card Number *</label>
                <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-2">
                  <CreditCard className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="4560 1234 5678 0101"
                    className="w-full outline-0 px-2"
                    value={paymentInfo.cardNumber}
                    onChange={handleCardChange}
                  />
                </div>
              </div>

              <div className="mt-5">
                <label>Cardholder Name *</label>
                <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-2">
                  <User className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full outline-0 px-2"
                    value={paymentInfo.cardName}
                    onChange={(e) =>
                      setPaymentInfo({ ...paymentInfo, cardName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-5">
                <div className="w-[48%]">
                  <label>Expiry Date *</label>
                  <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-2">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full outline-0 px-2"
                      value={paymentInfo.expiryDate}
                      onChange={handleExpiryChange}
                    />
                  </div>
                </div>

                <div className="w-[48%]">
                  <label>CVV *</label>
                  <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-2">
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full outline-0 px-2"
                      value={paymentInfo.cvv}
                      onChange={handleCvvChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-5">
                <button
                  className="w-[48%] bg-gray-200 py-3 rounded-2xl hover:bg-gray-300"
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </button>
                <button
                  className="w-[48%] bg-blue-600 text-white py-3 rounded-2xl hover:bg-blue-700"
                  onClick={() => setCurrentStep(3)}
                >
                  Review Booking →
                </button>
              </div>
            </>
          )}

          {/* Step 3: Review & Confirm */}
          {currentStep === 3 && (
            <>
              <h2 className="text-2xl font-bold mb-5">Review Your Booking</h2>

              <div className="bg-gray-50 rounded-xl p-6 mb-5">
                <h3 className="font-bold text-lg mb-4">Guest Information</h3>
                <p><strong>Name:</strong> {guestInfo.firstName} {guestInfo.lastName}</p>
                <p><strong>Email:</strong> {guestInfo.email}</p>
                <p><strong>Phone:</strong> {guestInfo.phone}</p>
                <p><strong>Country:</strong> {guestInfo.country}</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 mb-5">
                <h3 className="font-bold text-lg mb-4">Payment Method</h3>
                <p><strong>Card ending in:</strong> **** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
                <p><strong>Name:</strong> {paymentInfo.cardName}</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5">
                <p className="text-sm text-yellow-800">
                  By confirming this booking, you agree to our Terms & Conditions and Privacy Policy.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  className="flex-1 bg-gray-200 py-3 rounded-2xl hover:bg-gray-300"
                  onClick={() => setCurrentStep(2)}
                >
                  Back
                </button>

                <button
                  className="flex-1 bg-green-600 text-white py-3 rounded-2xl hover:bg-green-700 disabled:opacity-50"
                  onClick={handleConfirmBooking}
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading ? "Processing..." : "Confirm Booking"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Booking Summary */}
        <div className="w-[30%] shadow-2xl rounded-2xl bg-white p-5 hidden md:block">
            {/* Title */}
            <h2 className="text-lg font-bold">Booking Summary</h2>

            {/* Dates & Duration */}
            <div className="space-y-2 mt-5">
                <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                <Calendar className="text-blue-600 w-5 h-5" />
                <div>
                    <p className="text-xs text-gray-500">Check-in</p>
                    <p className="font-semibold text-sm">Mar 14, 2026</p>
                </div>
                </div>
                <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                <Calendar className="text-blue-600 w-5 h-5" />
                <div>
                    <p className="text-xs text-gray-500">Check-out</p>
                    <p className="font-semibold text-sm">Mar 16, 2026</p>
                </div>
                </div>
                <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                <Clock className="text-blue-600 w-5 h-5" />
                <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-semibold text-sm">2 Nights</p>
                </div>
                </div>
            </div>

            {/* Guests / Rooms */}
            <div className="grid grid-cols-3 text-center border rounded-lg overflow-hidden mt-5">
                <div className="py-3 border-r">
                    <Home className="mx-auto text-blue-600 w-5 h-5" />
                    <p className="font-bold text-lg">3</p>
                    <p className="text-xs text-gray-500">Rooms</p>
                </div>
                <div className="py-3 border-r">
                    <Users className="mx-auto text-blue-600 w-5 h-5" />
                    <p className="font-bold text-lg">8</p>
                    <p className="text-xs text-gray-500">Adults</p>
                </div>
                <div className="py-3">
                    <Smile className="mx-auto text-blue-600 w-5 h-5" />
                    <p className="font-bold text-lg">2</p>
                    <p className="text-xs text-gray-500">Kids</p>
                </div>
            </div>

            {/* Room Details */}
            <div className="space-y-2 mt-5">
                <p className="font-semibold text-sm">Room Details</p>
                <div className="flex justify-between text-sm">
                    <span>Deluxe Double Room × 2</span>
                    <span>$312</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>Superior Family Room × 1</span>
                    <span>$196</span>
                </div>
            </div>

            <hr className="my-2" />

            {/* Pricing */}
            <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                    <span>Subtotal (2 nights)</span>
                    <span>$1016.00</span>
                </div>
                <div className="flex justify-between">
                    <span>Taxes & Fees</span>
                    <span>$101.60</span>
                </div>
                <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>$25.00</span>
                </div>
            </div>

            <hr className="my-2" />

            {/* Total */}
            <div className="flex justify-between items-center text-lg font-bold mt-5">
                <span>Total</span>
                <span className="text-blue-600 text-xl">$1142.60</span>
            </div>

            {/* Free cancellation */}
            <div className="bg-green-50 border mt-5 border-green-200 rounded-lg p-3 text-green-800 text-sm flex items-center gap-2">
                <span>✅</span>
                <span>Free cancellation up to 4 days before check-in</span>
            </div>

        </div>
      </div>
    </div>
  );
}