import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, subject, message } = formData;

    if (!name || !email || !subject || !message) {
      toast.error('All fields are required.');
      return;
    }

    setLoading(true);
    // Simulate API submission
    setTimeout(() => {
      setLoading(false);
      toast.success('Query submitted successfully! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1000);
  };

  return (
    <div className="bg-gray-50 min-h-[80vh] py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-serif text-4xl md:text-5xl font-bold uppercase tracking-wider text-brand-primary mb-4">
            Contact Us
          </h1>
          <div className="w-16 h-0.5 bg-brand-accent mx-auto mb-4"></div>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
            Have questions? Our support team is here to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white border border-gray-100 shadow-xl rounded-sm overflow-hidden">
          {/* Info Side (Col 5) */}
          <div className="lg:col-span-5 bg-brand-primary text-white p-8 md:p-12 flex flex-col justify-between">
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-2xl font-bold mb-3 text-brand-accent">Get in Touch</h3>
                <p className="text-sm text-gray-300">
                  Fill out the form and our team will get back to you within 24 hours.
                </p>
              </div>

              <div className="space-y-6">
                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-brand-light rounded-sm text-brand-accent mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs uppercase tracking-wider font-bold text-gray-400">Phone</h5>
                    <p className="text-sm text-gray-200 mt-1">+91 9798979897</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-brand-light rounded-sm text-brand-accent mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs uppercase tracking-wider font-bold text-gray-400">Email</h5>
                    <p className="text-sm text-gray-200 mt-1">support@emart.com</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-brand-light rounded-sm text-brand-accent mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs uppercase tracking-wider font-bold text-gray-400">Office</h5>
                    <p className="text-sm text-gray-200 mt-1">
                      100 Connaught Place<br />New Delhi, 110001
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-brand-light rounded-sm text-brand-accent mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs uppercase tracking-wider font-bold text-gray-400">Hours</h5>
                    <p className="text-sm text-gray-200 mt-1">
                      Monday - Friday: 9 AM - 6 PM EST
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-gray-400 mt-12 pt-6 border-t border-brand-light tracking-wider uppercase font-semibold">
              eMart Support Network
            </div>
          </div>

          {/* Form Side (Col 7) */}
          <div className="lg:col-span-7 p-8 md:p-12">
            <h3 className="font-serif text-2xl font-bold text-brand-primary mb-6">Send Us a Message</h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Vaibhav Sharma"
                  className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-sm placeholder-gray-400 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="vaibhav.sharma@gmail.com"
                  className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-sm placeholder-gray-400 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                />
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-sm placeholder-gray-400 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                  Message / Query
                </label>
                <textarea
                  name="message"
                  required
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your details here..."
                  className="w-full px-4 py-3 text-sm bg-white border border-gray-200 rounded-sm placeholder-gray-400 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all resize-none"
                ></textarea>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-primary hover:bg-brand-light text-white text-xs uppercase tracking-widest font-bold py-4 rounded-sm transition-all duration-200 flex items-center justify-center gap-2 border border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
