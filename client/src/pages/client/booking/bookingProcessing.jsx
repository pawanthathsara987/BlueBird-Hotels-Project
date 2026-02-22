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
    <div className="m-0 p-4 sm:p-10 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Complete Your Booking</h1>
        <p className="text-sm sm:text-base">Just a few steps to confirm your reservation</p>
      </div>

      {/* Step Indicator */}
      <div className="w-full max-w-7xl mx-auto flex justify-center items-center mb-10 overflow-x-auto">
        {steps.map((step, index) => (
          <div className="flex items-center" key={step.number}>
            <div className="flex flex-col items-center text-center">
              <div
                className={`rounded-full w-10 h-10 sm:w-12 sm:h-12 flex justify-center items-center ${
                  currentStep >= step.number ? "bg-blue-600 text-white" : "bg-gray-200"
                } font-bold text-sm sm:text-base`}
              >
                {step.number}
              </div>
              <span className="font-medium text-[10px] sm:text-xs mt-1 block w-20 sm:w-24">{step.title}</span>
            </div>
            {index !== steps.length - 1 && (
              <div
                className={`w-12 sm:w-24 h-1 mx-2 sm:mx-5 ${
                  currentStep > step.number ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto mt-10 flex flex-col lg:flex-row gap-6">
        {/* Left Panel - Form */}
        <div className="w-full lg:w-[65%] p-5 sm:p-8 rounded-2xl bg-white shadow-2xl order-1">
          {/* Step 1: Guest Info */}
          {currentStep === 1 && (
            <>
              <h2 className="text-xl sm:text-2xl font-bold mb-5">Guest Information</h2>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="w-full sm:w-[48%]">
                  <label className="text-sm font-semibold">First Name *</label>
                  <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-3">
                    <User className="w-5 h-5 text-gray-400" />
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
                <div className="w-full sm:w-[48%]">
                  <label className="text-sm font-semibold">Last Name *</label>
                  <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-3">
                    <User className="w-5 h-5 text-gray-400" />
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
                <label className="text-sm font-semibold">Email *</label>
                <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-3">
                  <Mail className="w-5 h-5 text-gray-400" />
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
                <label className="text-sm font-semibold">Mobile Number *</label>
                <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-3">
                  <Phone className="w-5 h-5 text-gray-400" />
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
                <label className="text-sm font-semibold">Country *</label>
                <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
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
                className="mt-5 w-full bg-blue-600 text-white py-3 rounded-2xl hover:bg-blue-700 transition-colors font-semibold"
                onClick={() => setCurrentStep(2)}
              >
                Continue to Payment →
              </button>
            </>
          )}

          {/* Step 2: Payment Info */}
          {currentStep === 2 && (
            <>
              <h2 className="text-xl sm:text-2xl font-bold mb-5">Payment Information</h2>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                <p className="text-sm text-blue-800">💳 This is a demo. Use test card: 4532 1234 5678 9010</p>
              </div>

              <div className="mt-5">
                <label className="text-sm font-semibold">Card Number *</label>
                <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-3">
                  <CreditCard className="text-gray-400 w-5 h-5" />
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
                <label className="text-sm font-semibold">Cardholder Name *</label>
                <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-3">
                  <User className="text-gray-400 w-5 h-5" />
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

              <div className="flex flex-col sm:flex-row gap-4 mt-5">
                <div className="w-full sm:w-[48%]">
                  <label className="text-sm font-semibold">Expiry Date *</label>
                  <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-3">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full outline-0 px-2"
                      value={paymentInfo.expiryDate}
                      onChange={handleExpiryChange}
                    />
                  </div>
                </div>

                <div className="w-full sm:w-[48%]">
                  <label className="text-sm font-semibold">CVV *</label>
                  <div className="flex items-center border-2 border-gray-300 rounded-2xl mt-2 py-3 px-3">
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

              <div className="flex flex-col sm:flex-row gap-4 mt-5">
                <button
                  className="w-full sm:w-[48%] bg-gray-200 py-3 rounded-2xl hover:bg-gray-300 transition-colors font-semibold"
                  onClick={() => setCurrentStep(1)}
                >
                  Back
                </button>
                <button
                  className="w-full sm:w-[48%] bg-blue-600 text-white py-3 rounded-2xl hover:bg-blue-700 transition-colors font-semibold"
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
              <h2 className="text-xl sm:text-2xl font-bold mb-5">Review Your Booking</h2>

              <div className="bg-gray-50 rounded-xl p-5 mb-5">
                <h3 className="font-bold text-lg mb-4">Guest Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {guestInfo.firstName} {guestInfo.lastName}</p>
                  <p><strong>Email:</strong> {guestInfo.email}</p>
                  <p><strong>Phone:</strong> {guestInfo.phone}</p>
                  <p><strong>Country:</strong> {guestInfo.country}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 mb-5">
                <h3 className="font-bold text-lg mb-4">Payment Method</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Card ending in:</strong> **** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
                  <p><strong>Name:</strong> {paymentInfo.cardName}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5">
                <p className="text-sm text-yellow-800">
                  ⚠️ By confirming this booking, you agree to our Terms & Conditions and Privacy Policy.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="flex-1 bg-gray-200 py-3 rounded-2xl hover:bg-gray-300 transition-colors font-semibold"
                  onClick={() => setCurrentStep(2)}
                >
                  Back
                </button>

                <button
                  className="flex-1 bg-green-600 text-white py-3 rounded-2xl hover:bg-green-700 disabled:opacity-50 transition-colors font-semibold"
                  onClick={handleConfirmBooking}
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading ? "Processing..." : "✅ Confirm Booking"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Booking Summary - order-2 on mobile (shows below form), order-2 on desktop (shows on right) */}
        <div className="w-full lg:w-[30%] shadow-2xl rounded-2xl bg-white p-5 order-2 lg:sticky lg:top-8 lg:self-start">
          {/* Title */}
          <h2 className="text-lg font-bold">Booking Summary</h2>

          {/* Dates & Duration */}
          <div className="space-y-2 mt-5">
            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
              <Calendar className="text-blue-600 w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Check-in</p>
                <p className="font-semibold text-sm">Mar 14, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
              <Calendar className="text-blue-600 w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Check-out</p>
                <p className="font-semibold text-sm">Mar 16, 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
              <Clock className="text-blue-600 w-5 h-5 flex-shrink-0" />
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
              <span className="text-gray-700">Deluxe Double Room × 2</span>
              <span className="font-semibold">$312</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Superior Family Room × 1</span>
              <span className="font-semibold">$196</span>
            </div>
          </div>

          <hr className="my-4 border-gray-200" />

          {/* Pricing */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal (2 nights)</span>
              <span className="font-semibold">$1016.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Taxes & Fees</span>
              <span className="font-semibold">$101.60</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Fee</span>
              <span className="font-semibold">$25.00</span>
            </div>
          </div>

          <hr className="my-4 border-gray-200" />

          {/* Total */}
          <div className="flex justify-between items-center font-bold mt-5">
            <span className="text-lg">Total</span>
            <span className="text-blue-600 text-2xl">$1142.60</span>
          </div>

          {/* Free cancellation */}
          <div className="bg-green-50 border mt-5 border-green-200 rounded-lg p-3 text-green-800 text-xs flex items-center gap-2">
            <span>✅</span>
            <span>Free cancellation up to 4 days before check-in</span>
          </div>
        </div>
      </div>
    </div>
  );
}