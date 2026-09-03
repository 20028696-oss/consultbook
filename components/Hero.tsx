export default function Hero() {
  return (
    <section className="bg-[#0d1b4c] text-white py-24">
      <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">

        <div className="max-w-xl">

          <span className="bg-blue-800 px-4 py-2 rounded-full text-sm">
            ACADEMIC CONSULTATION PLATFORM
          </span>

          <h1 className="text-7xl font-bold mt-8">
            Book.
            <br />
            Consult.
            <br />
            <span className="text-blue-400">
              Succeed.
            </span>
          </h1>

          <p className="mt-8 text-xl text-gray-300 leading-8">
            Connect with your lecturers instantly.
            View availability, book sessions,
            and manage consultations in one place.
          </p>

          <div className="mt-10 flex gap-6">

            <button className="bg-blue-600 px-8 py-4 rounded-xl font-semibold">
              Book a Session
            </button>

            <button className="border border-white px-8 py-4 rounded-xl font-semibold">
              Learn More
            </button>

          </div>

        </div>

        <div className="bg-[#203268] rounded-3xl p-10 w-[420px] shadow-2xl">

          <h3 className="text-xl font-bold mb-8">
            ConsultBook
          </h3>

          <div className="grid grid-cols-4 gap-4 mb-6">

            <div className="bg-green-200 text-green-700 p-4 rounded-lg text-center font-bold">
              12
            </div>

            <div className="bg-yellow-200 text-yellow-700 p-4 rounded-lg text-center font-bold">
              5
            </div>

            <div className="bg-gray-100 text-blue-700 p-4 rounded-lg text-center font-bold">
              8
            </div>

            <div className="bg-red-200 text-red-700 p-4 rounded-lg text-center font-bold">
              2
            </div>

          </div>

          <div className="bg-white h-12 rounded-lg mb-4"></div>
          <div className="bg-white h-12 rounded-lg mb-8"></div>

          <button className="bg-blue-600 w-full py-3 rounded-lg font-semibold">
            Book Now
          </button>

        </div>

      </div>
    </section>
  );
}