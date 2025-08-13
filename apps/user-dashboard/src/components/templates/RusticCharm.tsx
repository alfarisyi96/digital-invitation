import React from 'react';
import { EditableText } from '../create/atoms/EditableText';
import { EditableImage } from '../create/atoms/EditableImage';

interface RusticCharmProps {
  formData: any;
  customText: Record<string, string>;
  fonts: Record<string, string>;
  colors: Record<string, string>;
}

export const RusticCharm: React.FC<RusticCharmProps> = ({
  formData,
  customText,
  fonts,
  colors
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Wooden Frame Effect */}
        <div className="bg-amber-900 p-4 rounded-lg shadow-2xl">
          <div className="bg-amber-100 rounded border-4 border-amber-800 border-dashed">
            
            {/* Header */}
            <div className="text-center p-8 bg-amber-200 rounded-t">
              <div className="text-4xl mb-4">🌾</div>
              <h1 className="text-4xl font-serif text-amber-900 mb-4">
                <EditableText
                  textKey="rustic-title"
                  defaultValue={customText.title || "Rustic Wedding"}
                  className="block"
                  tag="h1"
                />
              </h1>
              <div className="text-lg text-amber-800">
                <EditableText
                  textKey="rustic-subtitle"
                  defaultValue={customText.subtitle || "A Country Celebration"}
                  className="block"
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="p-8">
              
              {/* Couple Section */}
              <div className="text-center mb-8">
                <div className="text-xl text-amber-800 mb-6">
                  <EditableText
                    textKey="rustic-announcement"
                    defaultValue="Together with our families, we invite you to our wedding"
                    className="block"
                  />
                </div>
                
                <div className="flex justify-center items-center gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-3 border-4 border-amber-700 rounded-full overflow-hidden bg-amber-200">
                      <EditableImage
                        imageKey="rustic-bride-photo"
                        placeholder="Bride Photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-2xl font-serif text-amber-900">
                      <EditableText
                        textKey="rustic-bride-name"
                        defaultValue={customText.brideName || formData?.brideName || "Emma"}
                        className="block"
                        tag="h2"
                      />
                    </h2>
                  </div>
                  
                  <div className="text-3xl text-amber-700">🤍</div>
                  
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-3 border-4 border-amber-700 rounded-full overflow-hidden bg-amber-200">
                      <EditableImage
                        imageKey="rustic-groom-photo"
                        placeholder="Groom Photo"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-2xl font-serif text-amber-900">
                      <EditableText
                        textKey="rustic-groom-name"
                        defaultValue={customText.groomName || formData?.groomName || "Jack"}
                        className="block"
                        tag="h2"
                      />
                    </h2>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="bg-white p-6 rounded-lg border-2 border-amber-300 mb-8">
                <div className="text-center">
                  <h3 className="text-2xl font-serif text-amber-900 mb-4">Wedding Details</h3>
                  <div className="text-amber-800 space-y-3">
                    <div className="flex justify-center items-center gap-2">
                      <span className="text-xl">📅</span>
                      <EditableText
                        textKey="rustic-event-date"
                        defaultValue={customText.eventDate || formData?.eventDate || "Saturday, June 15, 2024"}
                        className="text-lg"
                      />
                    </div>
                    <div className="flex justify-center items-center gap-2">
                      <span className="text-xl">⏰</span>
                      <EditableText
                        textKey="rustic-event-time"
                        defaultValue={customText.eventTime || formData?.eventTime || "5:00 PM"}
                        className="text-lg"
                      />
                    </div>
                    <div className="flex justify-center items-center gap-2">
                      <span className="text-xl">🏡</span>
                      <EditableText
                        textKey="rustic-venue"
                        defaultValue={customText.venue || formData?.venue || "Barn at Sunset Farm"}
                        className="text-lg font-medium"
                      />
                    </div>
                    <div className="flex justify-center items-center gap-2">
                      <span className="text-xl">📍</span>
                      <EditableText
                        textKey="rustic-address"
                        defaultValue={customText.location || formData?.location || "123 Country Road, Countryside Valley"}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reception Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-600">
                  <h4 className="text-lg font-serif text-amber-900 mb-3">🍽️ Reception</h4>
                  <div className="text-amber-800">
                    <EditableText
                      textKey="rustic-reception-info"
                      defaultValue="Dinner and dancing to follow immediately after the ceremony. Country BBQ and live music!"
                      className="block"
                    />
                  </div>
                </div>
                
                <div className="bg-amber-50 p-6 rounded-lg border-l-4 border-amber-600">
                  <h4 className="text-lg font-serif text-amber-900 mb-3">👗 Attire</h4>
                  <div className="text-amber-800">
                    <EditableText
                      textKey="rustic-attire"
                      defaultValue="Cocktail attire suggested. Comfortable shoes recommended for outdoor venue."
                      className="block"
                    />
                  </div>
                </div>
              </div>

              {/* RSVP */}
              <div className="text-center bg-amber-700 text-white p-6 rounded-lg">
                <h3 className="text-xl font-serif mb-3">
                  <EditableText
                    textKey="rustic-rsvp-title"
                    defaultValue="Please Join Us!"
                    className="block"
                  />
                </h3>
                <p className="mb-3">
                  <EditableText
                    textKey="rustic-rsvp-text"
                    defaultValue="Kindly respond by May 1st, 2024"
                    className="block"
                  />
                </p>
                <div className="text-sm opacity-90">
                  <EditableText
                    textKey="rustic-contact"
                    defaultValue="Call or text: (555) 123-4567 | emma.jack@countrywedding.com"
                    className="block"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center p-6 bg-amber-200 rounded-b">
              <div className="text-2xl mb-2">🌻</div>
              <p className="text-amber-900 italic">
                <EditableText
                  textKey="rustic-closing"
                  defaultValue="Can't wait to celebrate with our favorite people!"
                  className="block"
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
