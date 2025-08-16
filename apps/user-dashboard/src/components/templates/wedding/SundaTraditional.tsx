import React from 'react'
import { EditableText } from '@/components/create/atoms/EditableText'
import { EditableImage } from '@/components/create/atoms/EditableImage'
import { EditableGallery } from '@/components/create/atoms/EditableGallery'
import { WeddingFormData } from '@/services/supabaseService'

interface SundaTraditionalProps {
  formData: WeddingFormData
  customization?: any
  images?: {
    hero_image?: string
    bride_image?: string
    groom_image?: string
    gallery_photos?: string[]
  }
}

/**
 * Sunda Traditional Wedding Template
 * 
 * Features:
 * - Traditional Indonesian Sunda design
 * - Elegant typography with traditional elements
 * - Gold and earth tone color scheme
 * - Batik-inspired patterns
 */
export function SundaTraditional({ formData, customization, images }: SundaTraditionalProps) {
  return (
    <div className="sunda-template bg-gradient-to-b from-amber-50 to-yellow-50 min-h-screen">
      {/* Traditional Border Pattern */}
      <div className="border-pattern h-4 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600"></div>
      
      {/* Hero Section with Traditional Frame */}
      <div className="relative px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Traditional Ornament */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-600 to-yellow-700 rounded-full flex items-center justify-center mb-4">
              <div className="w-12 h-12 border-4 border-yellow-200 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-yellow-200 rounded-full"></div>
              </div>
            </div>
            
            <EditableText
              textKey="traditional_greeting"
              defaultValue="Bismillahirrahmanirrahim"
              className="text-lg text-amber-800 font-serif italic mb-4"
              style={{ fontFamily: 'var(--body-font)' }}
              tag="p"
            />
            
            <EditableText
              textKey="invitation_opening"
              defaultValue="Dengan memohon rahmat dan ridho Allah SWT"
              className="text-sm text-amber-700 mb-6"
              style={{ fontFamily: 'var(--body-font)' }}
              tag="p"
            />
          </div>

          {/* Hero Image Frame */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-yellow-400 rounded-lg transform rotate-1"></div>
            <div className="relative bg-white p-6 rounded-lg shadow-lg">
              <EditableImage
                imageKey="hero"
                src={images?.hero_image}
                className="w-full h-64 rounded-lg object-cover"
                placeholder="Upload Hero Image"
              />
            </div>
          </div>

          {/* Couple Names with Traditional Styling */}
          <div className="text-center mb-8">
            <EditableText
              textKey="wedding_announcement"
              defaultValue="Mengundang Bapak/Ibu/Saudara/i pada acara pernikahan"
              className="text-sm text-amber-700 mb-4"
              style={{ fontFamily: 'var(--body-font)' }}
              tag="p"
            />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-amber-300"></div>
              </div>
              <div className="relative flex justify-center text-amber-800">
                <span className="bg-gradient-to-b from-amber-50 to-yellow-50 px-6 text-3xl font-bold"
                      style={{ fontFamily: 'var(--heading-font)' }}>
                  &
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {/* Bride */}
              <div className="text-center">
                <EditableImage
                  imageKey="bride"
                  src={images?.bride_image}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-amber-300 shadow-lg"
                  placeholder="Bride Photo"
                />
                <EditableText
                  textKey="bride_name"
                  defaultValue={formData.bride_full_name || 'Putri'}
                  className="text-2xl font-bold text-amber-800 mb-2"
                  style={{ fontFamily: 'var(--heading-font)' }}
                  tag="h3"
                />
                <EditableText
                  textKey="bride_title"
                  defaultValue="Putri dari"
                  className="text-sm text-amber-600 mb-1"
                  style={{ fontFamily: 'var(--body-font)' }}
                  tag="p"
                />
                <EditableText
                  textKey="bride_parents"
                  defaultValue={`Bapak ${formData.bride_father || 'Ayah'} & Ibu ${formData.bride_mother || 'Ibu'}`}
                  className="text-sm text-amber-700"
                  style={{ fontFamily: 'var(--body-font)' }}
                  tag="p"
                />
              </div>

              {/* Groom */}
              <div className="text-center">
                <EditableImage
                  imageKey="groom"
                  src={images?.groom_image}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-amber-300 shadow-lg"
                  placeholder="Groom Photo"
                />
                <EditableText
                  textKey="groom_name"
                  defaultValue={formData.groom_full_name || 'Putra'}
                  className="text-2xl font-bold text-amber-800 mb-2"
                  style={{ fontFamily: 'var(--heading-font)' }}
                  tag="h3"
                />
                <EditableText
                  textKey="groom_title"
                  defaultValue="Putra dari"
                  className="text-sm text-amber-600 mb-1"
                  style={{ fontFamily: 'var(--body-font)' }}
                  tag="p"
                />
                <EditableText
                  textKey="groom_parents"
                  defaultValue={`Bapak ${formData.groom_father || 'Ayah'} & Ibu ${formData.groom_mother || 'Ibu'}`}
                  className="text-sm text-amber-700"
                  style={{ fontFamily: 'var(--body-font)' }}
                  tag="p"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details with Traditional Card Design */}
      <div className="bg-gradient-to-r from-amber-100 to-yellow-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <EditableText
              textKey="event_section_title"
              defaultValue="Waktu & Tempat Acara"
              className="text-2xl font-bold text-amber-800 mb-4"
              style={{ fontFamily: 'var(--heading-font)' }}
              tag="h2"
            />
            <div className="w-24 h-1 bg-gradient-to-r from-amber-600 to-yellow-600 mx-auto"></div>
          </div>
          
          {formData.events && formData.events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.events.map((event, index) => (
                <div key={index} className="relative">
                  {/* Traditional corner decorations */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-amber-600"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-amber-600"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-amber-600"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-amber-600"></div>
                  
                  <div className="bg-white p-8 m-4 rounded-lg shadow-lg">
                    <EditableText
                      textKey={`event_${index}_title`}
                      defaultValue={event.name || `Acara ${index + 1}`}
                      className="text-xl font-bold text-amber-800 mb-3 text-center"
                      style={{ fontFamily: 'var(--heading-font)' }}
                      tag="h3"
                    />
                    
                    <div className="space-y-2 text-center">
                      <EditableText
                        textKey={`event_${index}_date`}
                        defaultValue={event.date || 'Tanggal'}
                        className="text-lg font-semibold text-amber-700"
                        style={{ fontFamily: 'var(--body-font)' }}
                        tag="p"
                      />
                      <EditableText
                        textKey={`event_${index}_time`}
                        defaultValue={event.time || 'Waktu'}
                        className="text-base text-amber-600"
                        style={{ fontFamily: 'var(--body-font)' }}
                        tag="p"
                      />
                      <div className="border-t border-amber-200 my-3"></div>
                      <EditableText
                        textKey={`event_${index}_venue`}
                        defaultValue={event.venue_name || 'Nama Tempat'}
                        className="text-base font-semibold text-amber-700"
                        style={{ fontFamily: 'var(--body-font)' }}
                        tag="p"
                      />
                      <EditableText
                        textKey={`event_${index}_address`}
                        defaultValue={event.venue_address || 'Alamat Lengkap'}
                        className="text-sm text-amber-600"
                        style={{ fontFamily: 'var(--body-font)' }}
                        tag="p"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <p className="text-amber-600">Detail acara akan ditampilkan di sini</p>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Section with Traditional Touch */}
      <div className="py-16 px-6 bg-gradient-to-b from-amber-50 to-yellow-50">
        <div className="max-w-4xl mx-auto">
          {/* Traditional Ornament */}
          <div className="text-center mb-12">
            <div className="inline-block">
              <div className="w-16 h-1 bg-gradient-to-r from-amber-600 to-yellow-600 mx-auto mb-4"></div>
              <EditableText
                textKey="gallery_title"
                defaultValue="Galeri Kenangan"
                className="text-3xl font-bold text-amber-800 mb-2"
                style={{ fontFamily: 'var(--heading-font)' }}
                tag="h2"
              />
              <EditableText
                textKey="gallery_subtitle"
                defaultValue="Momen-momen berharga dalam perjalanan cinta kami"
                className="text-amber-700"
                style={{ fontFamily: 'var(--body-font)' }}
                tag="p"
              />
              <div className="w-16 h-1 bg-gradient-to-r from-amber-600 to-yellow-600 mx-auto mt-4"></div>
            </div>
          </div>
          
          <EditableGallery
            maxImages={6}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
            placeholder="Tambahkan Foto Galeri"
            images={images?.gallery_photos}
          />
        </div>
      </div>

      {/* Gift Section with Traditional Design */}
      {formData.gift_accounts && formData.gift_accounts.length > 0 && (
        <div className="bg-gradient-to-b from-yellow-50 to-amber-50 py-12">
          <div className="max-w-2xl mx-auto px-6">
            <div className="text-center mb-8">
              <EditableText
                textKey="gift_section_title"
                defaultValue="Hadiah Pernikahan"
                className="text-2xl font-bold text-amber-800 mb-4"
                style={{ fontFamily: 'var(--heading-font)' }}
                tag="h2"
              />
              <EditableText
                textKey="gift_section_subtitle"
                defaultValue="Doa restu dari Bapak/Ibu/Saudara/i sudah cukup bagi kami. Namun apabila memberi hadiah, dapat melalui:"
                className="text-sm text-amber-700"
                style={{ fontFamily: 'var(--body-font)' }}
                tag="p"
              />
            </div>
            
            <div className="space-y-4">
              {formData.gift_accounts.map((account, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-amber-600">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-800 font-bold text-lg">
                        {account.account_type === 'bank' ? '🏦' : account.account_type === 'ewallet' ? '📱' : '💰'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <EditableText
                        textKey={`gift_${index}_bank`}
                        defaultValue={account.bank_name || 'Nama Bank/E-Wallet'}
                        className="font-semibold text-amber-800"
                        style={{ fontFamily: 'var(--body-font)' }}
                        tag="p"
                      />
                      <EditableText
                        textKey={`gift_${index}_number`}
                        defaultValue={account.account_number || 'Nomor Rekening'}
                        className="text-amber-700 font-mono"
                        tag="p"
                      />
                      <EditableText
                        textKey={`gift_${index}_name`}
                        defaultValue={account.account_name || 'Nama Pemilik'}
                        className="text-sm text-amber-600"
                        style={{ fontFamily: 'var(--body-font)' }}
                        tag="p"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Closing with Traditional Pattern */}
      <div className="bg-gradient-to-r from-amber-600 to-yellow-600 py-12 text-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <EditableText
            textKey="closing_message"
            defaultValue="Atas kehadiran dan doa restu dari Bapak/Ibu/Saudara/i, kami ucapkan terima kasih."
            className="text-lg mb-4"
            style={{ fontFamily: 'var(--body-font)' }}
            tag="p"
          />
          
          <div className="space-y-2">
            <EditableText
              textKey="closing_signature"
              defaultValue="Wassalamu'alaikum Wr. Wb."
              className="text-base italic"
              style={{ fontFamily: 'var(--body-font)' }}
              tag="p"
            />
            <EditableText
              textKey="family_signature"
              defaultValue="Keluarga Besar Kedua Mempelai"
              className="text-sm font-semibold"
              style={{ fontFamily: 'var(--body-font)' }}
              tag="p"
            />
          </div>
        </div>
      </div>

      {/* Traditional Bottom Border */}
      <div className="border-pattern h-4 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600"></div>
    </div>
  )
}
