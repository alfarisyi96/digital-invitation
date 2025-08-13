import React from 'react';
import { EditableText } from '../create/atoms/EditableText';

interface RoyalElegantProps {
  formData: any;
  customText: Record<string, string>;
  fonts: Record<string, string>;
  colors: Record<string, string>;
}

export const RoyalElegant: React.FC<RoyalElegantProps> = ({
  formData,
  customText,
  fonts,
  colors
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 p-8">
      {/* Header Crown */}
      <div className="text-center mb-8">
        <div className="text-6xl text-purple-600 mb-4">♛</div>
        <div className="w-32 h-px bg-gradient-to-r from-purple-400 to-purple-600 mx-auto"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-purple-600 to-purple-800 text-white p-12 text-center">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative z-10">
            <div className="text-lg mb-4 tracking-wider opacity-90">
              <EditableText
                textKey="royal-subtitle"
                defaultValue={customText.subtitle || "By the Grace of God"}
                className="block"
              />
            </div>
            <h1 className="text-5xl mb-4 font-serif">
              <EditableText
                textKey="royal-title"
                defaultValue={customText.title || "Royal Wedding Invitation"}
                className="block"
                tag="h1"
              />
            </h1>
            <div className="text-xl tracking-widest">
              <EditableText
                textKey="royal-date"
                defaultValue={customText.eventDate || formData?.eventDate || "Saturday, June 15, 2024"}
                className="block"
              />
            </div>
          </div>
        </div>

        {/* Couple Section */}
        <div className="p-12 text-center">
          <div className="mb-8">
            <div className="text-2xl text-purple-800 mb-6 font-serif">
              <EditableText
                textKey="royal-announcement"
                defaultValue="Request the honor of your presence at the marriage of"
                className="block"
              />
            </div>
            
            <div className="flex justify-center items-center gap-8 mb-8">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 border-4 border-purple-200 rounded-full overflow-hidden">
                  <img
                    src="/placeholder-bride.jpg"
                    alt="Bride"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-3xl font-serif text-purple-800 mb-2">
                  <EditableText
                        textKey="royal-bride-name"
                    defaultValue={customText.brideName || formData?.brideName || "Princess Isabella"}
                    className="block"
                  />
                </h2>
                <p className="text-purple-600">
                  <EditableText
                        textKey="royal-bride-parents"
                    defaultValue="Daughter of Mr. & Mrs. Anderson"
                    className="block"
                  />
                </p>
              </div>

              <div className="text-6xl text-purple-400 font-serif">&</div>

              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 border-4 border-purple-200 rounded-full overflow-hidden">
                  <img
                    src="/placeholder-groom.jpg"
                    alt="Groom"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-3xl font-serif text-purple-800 mb-2">
                  <EditableText
                        textKey="royal-groom-name"
                    defaultValue={customText.groomName || formData?.groomName || "Prince Alexander"}
                    className="block"
                  />
                </h2>
                <p className="text-purple-600">
                  <EditableText
                        textKey="royal-groom-parents"
                    defaultValue="Son of Mr. & Mrs. Wellington"
                    className="block"
                  />
                </p>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="bg-purple-50 p-8 rounded-lg">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-serif text-purple-800 mb-4">Ceremony</h3>
                <div className="text-purple-700">
                  <p className="mb-2">
                    <EditableText
                          textKey="royal-ceremony-date"
                      defaultValue={customText.eventDate || formData?.eventDate || "Saturday, June 15, 2024"}
                      className="block"
                    />
                  </p>
                  <p className="mb-2">
                    <EditableText
                          textKey="royal-ceremony-time"
                      defaultValue={customText.eventTime || formData?.eventTime || "3:00 PM"}
                      className="block"
                    />
                  </p>
                  <p>
                    <EditableText
                          textKey="royal-ceremony-venue"
                      defaultValue={customText.venue || formData?.venue || "St. Mary's Cathedral"}
                      className="block"
                    />
                  </p>
                  <p className="text-sm mt-2">
                    <EditableText
                          textKey="royal-ceremony-address"
                      defaultValue={customText.location || formData?.location || "123 Cathedral Street, Royal City"}
                      className="block"
                    />
                  </p>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-serif text-purple-800 mb-4">Reception</h3>
                <div className="text-purple-700">
                  <p className="mb-2">
                    <EditableText
                          textKey="royal-reception-date"
                      defaultValue="Saturday, June 15, 2024"
                      className="block"
                    />
                  </p>
                  <p className="mb-2">
                    <EditableText
                          textKey="royal-reception-time"
                      defaultValue="6:00 PM"
                      className="block"
                    />
                  </p>
                  <p>
                    <EditableText
                          textKey="royal-reception-venue"
                      defaultValue="Royal Ballroom"
                      className="block"
                    />
                  </p>
                  <p className="text-sm mt-2">
                    <EditableText
                          textKey="royal-reception-address"
                      defaultValue="456 Palace Avenue, Royal City"
                      className="block"
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RSVP Section */}
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg">
            <h3 className="text-xl font-serif mb-4">
              <EditableText
                    textKey="royal-rsvp-title"
                defaultValue="Kindly Respond"
                className="block"
              />
            </h3>
            <p className="mb-4">
              <EditableText
                    textKey="royal-rsvp-text"
                defaultValue="Your presence would be the greatest gift of all. Please confirm your attendance by May 15, 2024."
                className="block"
              />
            </p>
            <div className="text-center">
              <EditableText
                    textKey="royal-contact"
                defaultValue="Contact: +1 (555) 123-4567 | isabella.alexander@wedding.com"
                className="block text-sm opacity-90"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8">
        <div className="text-4xl text-purple-400 mb-4">♛</div>
        <p className="text-purple-600 italic">
          <EditableText
                textKey="royal-closing"
            defaultValue="Together with our families, we invite you to share in our joy"
            className="block"
          />
        </p>
      </div>
    </div>
  );
};
