// Debug script to check localStorage for draft data
console.log('🔍 Checking localStorage for draft data...')

// Check for global draft
const globalDraft = localStorage.getItem('draft_invitation_global')
console.log('Global draft:', globalDraft ? JSON.parse(globalDraft) : 'None found')

// Check for any draft keys
const allKeys = Object.keys(localStorage)
const draftKeys = allKeys.filter(key => key.startsWith('draft_'))
console.log('All draft keys:', draftKeys)

// Check for session keys
const sessionKeys = Object.keys(sessionStorage)
console.log('Session storage keys:', sessionKeys)

// Manually create a test draft
const testDraft = {
  formData: {
    bride_full_name: 'Test Bride',
    groom_full_name: 'Test Groom'
  },
  selectedCategory: 'wedding',
  selectedTemplate: 'template_1',
  currentStep: 2,
  timestamp: Date.now(),
  lastSaved: new Date().toLocaleString()
}

localStorage.setItem('draft_invitation_global', JSON.stringify(testDraft))
console.log('✅ Test draft created!')
console.log('Now refresh the page to see if modal appears')
// Run this in browser console to simulate a saved draft

console.log('🧪 Creating test draft in localStorage...')

const testDraft = {
  formData: {
    bride_full_name: "Alice",
    bride_nickname: "Ali", 
    groom_full_name: "Bob",
    groom_nickname: "Bobby",
    wedding_date: "2025-12-25",
    ceremony_time: "14:00",
    reception_time: "18:00",
    venue_name: "Beautiful Garden",
    venue_address: "123 Wedding St",
    invitation_message: "Please join us for our special day!",
    bride_father: "John",
    bride_mother: "Jane", 
    groom_father: "Mike",
    groom_mother: "Mary"
  },
  selectedCategory: "wedding",
  selectedTemplate: "template_1",
  currentStep: 3,
  timestamp: Date.now(),
  lastSaved: new Date().toLocaleString()
}

localStorage.setItem('draft_invitation_global', JSON.stringify(testDraft))

console.log('✅ Test draft created:', testDraft)
console.log('📍 Now refresh the page to test the modal!')

// To clear the test draft:
// localStorage.removeItem('draft_invitation_global')
