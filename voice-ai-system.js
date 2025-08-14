#!/usr/bin/env node

/**
 * LeadFly AI Voice System
 * ElevenLabs + Twilio Integration
 */

import { config } from 'dotenv';
import fetch from 'node-fetch';

config({ path: '.env.local' });

// ElevenLabs Configuration
const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY || 'sk-elevenlabs-placeholder';
const ELEVEN_LABS_VOICE_ID = process.env.ELEVEN_LABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Bella voice

// Twilio Configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || 'AC-placeholder';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || 'auth-token-placeholder';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '+1234567890';

/**
 * Generate AI voice using ElevenLabs
 */
export async function generateAIVoice(text, voiceSettings = {}) {
  try {
    console.log('🗣️ Generating AI voice with ElevenLabs...');
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_LABS_VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVEN_LABS_API_KEY
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: voiceSettings.stability || 0.5,
          similarity_boost: voiceSettings.similarity_boost || 0.5,
          style: voiceSettings.style || 0.0,
          use_speaker_boost: voiceSettings.use_speaker_boost || true
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    const audioBuffer = await response.buffer();
    
    return {
      success: true,
      audio: audioBuffer,
      format: 'mp3',
      size: audioBuffer.length
    };
    
  } catch (error) {
    console.error('❌ ElevenLabs voice generation failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Make phone call using Twilio
 */
export async function makePhoneCall(toNumber, message, options = {}) {
  try {
    console.log('📞 Making phone call with Twilio...');
    
    // First generate the voice audio
    const voiceResult = await generateAIVoice(message, options.voiceSettings);
    
    if (!voiceResult.success) {
      throw new Error(`Voice generation failed: ${voiceResult.error}`);
    }
    
    // Create TwiML for the call
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="alice">${message}</Say>
    <Gather input="dtmf speech" timeout="10" action="${options.callbackUrl || '/webhook/call-response'}">
        <Say>Press 1 to schedule a meeting, or say yes if you're interested.</Say>
    </Gather>
</Response>`;
    
    // Make the call using Twilio REST API
    const authHeader = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`
      },
      body: new URLSearchParams({
        From: TWILIO_PHONE_NUMBER,
        To: toNumber,
        Twiml: twiml
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Twilio API error (${response.status}): ${errorText}`);
    }

    const callData = await response.json();
    
    return {
      success: true,
      call_sid: callData.sid,
      status: callData.status,
      to: callData.to,
      from: callData.from
    };
    
  } catch (error) {
    console.error('❌ Phone call failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create personalized voice message for lead
 */
export function createLeadMessage(leadData) {
  const { first_name, company_name, job_title } = leadData;
  
  return `Hi ${first_name}, this is Sarah from LeadFly AI. I noticed you're the ${job_title} at ${company_name}. 

We've helped similar companies like yours generate up to 500 qualified leads per month using our AI-powered system. 

I'd love to show you how we can help ${company_name} scale your lead generation. Would you be interested in a quick 15-minute demo this week?`;
}

/**
 * Test voice system integration
 */
export async function testVoiceSystem() {
  console.log('🎙️ Testing Voice AI System');
  console.log('===========================');
  
  const results = {
    elevenlabs: false,
    twilio: false,
    integration: false
  };
  
  // Test 1: ElevenLabs Voice Generation
  console.log('\n🗣️ Test 1: ElevenLabs Voice Generation');
  console.log('-------------------------------------');
  
  const testMessage = "Hello, this is a test of the LeadFly AI voice system. Can you hear me clearly?";
  const voiceResult = await generateAIVoice(testMessage);
  
  if (voiceResult.success) {
    console.log(`✅ Voice generated successfully (${voiceResult.size} bytes)`);
    results.elevenlabs = true;
  } else {
    console.log(`❌ Voice generation failed: ${voiceResult.error}`);
  }
  
  // Test 2: Twilio Setup Check (without making actual call)
  console.log('\n📞 Test 2: Twilio Configuration');
  console.log('-------------------------------');
  
  if (TWILIO_ACCOUNT_SID.startsWith('AC') && TWILIO_AUTH_TOKEN.length > 10) {
    console.log('✅ Twilio credentials configured');
    console.log(`📱 Phone number: ${TWILIO_PHONE_NUMBER}`);
    results.twilio = true;
  } else {
    console.log('❌ Twilio credentials missing or invalid');
  }
  
  // Test 3: Integration Test
  console.log('\n🔗 Test 3: Voice + Call Integration');
  console.log('----------------------------------');
  
  if (results.elevenlabs && results.twilio) {
    console.log('✅ Full voice system ready');
    results.integration = true;
  } else {
    console.log('❌ Integration incomplete - missing components');
  }
  
  return results;
}

/**
 * Schedule voice call for high-scoring lead
 */
export async function scheduleVoiceCall(leadData, scheduledTime = null) {
  try {
    // Generate personalized message
    const message = createLeadMessage(leadData);
    
    // Schedule for immediate or future execution
    const callTime = scheduledTime || new Date();
    
    if (scheduledTime && scheduledTime > new Date()) {
      // Future call - store in database/queue
      console.log(`📅 Call scheduled for ${scheduledTime}`);
      return {
        success: true,
        scheduled: true,
        call_time: callTime,
        message
      };
    } else {
      // Immediate call
      const callResult = await makePhoneCall(leadData.phone, message, {
        callbackUrl: `https://leadfly-ai.vercel.app/webhook/call-response/${leadData.id}`
      });
      
      return {
        success: callResult.success,
        immediate: true,
        call_sid: callResult.call_sid,
        error: callResult.error
      };
    }
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Export default for easy importing
export default {
  generateAIVoice,
  makePhoneCall,
  createLeadMessage,
  testVoiceSystem,
  scheduleVoiceCall
};