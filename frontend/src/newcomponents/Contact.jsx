import React, { useState } from "react";

import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  User,
  ArrowRight,
} from "lucide-react";


const Contact = () => {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });


  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  const handleSubmit = (e) => {

    e.preventDefault();

    console.log("Contact form submitted:", formData);

    // Backend/API integration can be added later

  };


  return (

    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-cyan-100 px-4 pb-16 pt-10 sm:px-6 lg:px-8">

      <main className="mx-auto max-w-7xl">


        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="rounded-3xl border border-blue-100 bg-white px-6 py-14 text-center shadow-xl shadow-blue-900/5 sm:px-10">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">

            <MessageSquare size={26} />

          </div>


          <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-blue-600">
            Contact Us
          </p>


          <h1 className="mt-3 text-4xl font-extrabold text-slate-900 sm:text-5xl">

            We're here to
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {" "}help
            </span>

          </h1>


          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">

            Have a question, suggestion or need help finding the right
            hostel? Send us a message and we'll get back to you.

          </p>

        </section>



        {/* =====================================================
            CONTACT CONTENT
        ===================================================== */}

        <section className="mt-8 grid gap-6 lg:grid-cols-5">


          {/* =================================================
              CONTACT INFORMATION
          ================================================= */}

          <div className="lg:col-span-2">

            <div className="h-full rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 p-7 text-white shadow-xl shadow-blue-500/20 sm:p-9">


              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-100">
                Get In Touch
              </p>


              <h2 className="mt-3 text-3xl font-extrabold">
                We'd love to hear from you.
              </h2>


              <p className="mt-5 text-sm leading-7 text-blue-50">

                Whether you have a question about our platform, need
                assistance with your search or want to share feedback,
                feel free to contact us.

              </p>


              <div className="mt-10 space-y-6">


                {/* Email */}

                <ContactInfo
                  icon={<Mail size={20} />}
                  title="Email"
                  value="support@hostelfinder.com"
                />


                {/* Phone */}

                <ContactInfo
                  icon={<Phone size={20} />}
                  title="Phone"
                  value="+91 98765 43210"
                />


                {/* Location */}

                <ContactInfo
                  icon={<MapPin size={20} />}
                  title="Location"
                  value="Hyderabad, Telangana, India"
                />


                {/* Working Hours */}

                <ContactInfo
                  icon={<Clock size={20} />}
                  title="Working Hours"
                  value="Mon - Sat, 9:00 AM - 6:00 PM"
                />

              </div>

            </div>

          </div>



          {/* =================================================
              CONTACT FORM
          ================================================= */}

          <div className="lg:col-span-3">

            <div className="rounded-3xl border border-blue-100 bg-white p-7 shadow-xl shadow-blue-900/5 sm:p-9">

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
                Send A Message
              </p>


              <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
                How can we help?
              </h2>


              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >


                {/* Name + Email */}

                <div className="grid gap-5 sm:grid-cols-2">


                  {/* Name */}

                  <div>

                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Your Name
                    </label>


                    <div className="relative">

                      <User
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />


                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                        className="
                          w-full
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          py-3
                          pl-11
                          pr-4
                          text-sm
                          text-slate-800
                          outline-none
                          transition
                          placeholder:text-slate-400
                          focus:border-blue-400
                          focus:bg-white
                          focus:ring-4
                          focus:ring-blue-100
                        "
                      />

                    </div>

                  </div>



                  {/* Email */}

                  <div>

                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email Address
                    </label>


                    <div className="relative">

                      <Mail
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />


                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                        className="
                          w-full
                          rounded-xl
                          border
                          border-slate-200
                          bg-slate-50
                          py-3
                          pl-11
                          pr-4
                          text-sm
                          text-slate-800
                          outline-none
                          transition
                          placeholder:text-slate-400
                          focus:border-blue-400
                          focus:bg-white
                          focus:ring-4
                          focus:ring-blue-100
                        "
                      />

                    </div>

                  </div>

                </div>



                {/* Subject */}

                <div>

                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Subject
                  </label>


                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What would you like to talk about?"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-3
                      text-sm
                      text-slate-800
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-blue-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />

                </div>



                {/* Message */}

                <div>

                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Message
                  </label>


                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    required
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      py-3
                      text-sm
                      text-slate-800
                      outline-none
                      transition
                      placeholder:text-slate-400
                      focus:border-blue-400
                      focus:bg-white
                      focus:ring-4
                      focus:ring-blue-100
                    "
                  />

                </div>



                {/* Submit */}

                <button
                  type="submit"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-blue-600
                    to-cyan-500
                    px-7
                    py-3.5
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-blue-500/20
                    transition
                    hover:-translate-y-0.5
                    hover:shadow-blue-500/40
                  "
                >

                  Send Message

                  <Send size={17} />

                </button>

              </form>

            </div>

          </div>

        </section>



        {/* =====================================================
            FAQ / HELP SECTION
        ===================================================== */}

        <section className="mt-8 rounded-3xl border border-blue-100 bg-white p-7 shadow-xl shadow-blue-900/5 sm:p-10">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">


            <div>

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
                Need More Help?
              </p>


              <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                Can't find what you're looking for?
              </h2>


              <p className="mt-2 text-sm text-slate-500">
                Send us your question and our team will help you.
              </p>

            </div>


            <button
              type="button"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-blue-200 px-5 py-3 text-sm font-bold text-blue-600 transition hover:bg-blue-50 md:self-auto"
            >
              Get Help

              <ArrowRight size={17} />

            </button>

          </div>

        </section>

      </main>

    </div>
  );
};



const ContactInfo = ({ icon, title, value }) => {

  return (

    <div className="flex items-start gap-4">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">

        {icon}

      </div>


      <div>

        <p className="text-xs font-semibold uppercase tracking-wider text-blue-100">
          {title}
        </p>

        <p className="mt-1 text-sm font-semibold text-white">
          {value}
        </p>

      </div>

    </div>

  );
};


export default Contact;