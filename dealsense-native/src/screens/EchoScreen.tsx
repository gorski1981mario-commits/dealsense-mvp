import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { COLORS } from '../lib/constants'
import { storage } from '../lib/storage'

interface Message {
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
}

interface EchoScreenProps {
  packageType: 'free' | 'plus'
  onClose: () => void
}

export default function EchoScreen({ packageType, onClose }: EchoScreenProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messagesLeft, setMessagesLeft] = useState(65) // PLUS: 65 messages/day
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    // Check if PLUS user
    if (packageType !== 'plus') {
      Alert.alert(
        '⚠️ PLUS vereist',
        'Echo Agent is alleen beschikbaar voor PLUS abonnees. Upgrade naar PLUS om Echo te gebruiken!',
        [{ text: 'OK', onPress: onClose }]
      )
      return
    }

    // Welcome message
    setMessages([
      {
        role: 'assistant',
        content:
          '👋 Hoi! Ik ben Echo, je persoonlijke AI assistent!\n\n**Ik kan je helpen met:**\n💡 Productadvies op maat\n📋 Garantie-informatie\n💰 Bespaartips\n❓ Algemene vragen\n\n**Tip:** Gebruik de Scanner om producten te vergelijken!\n\nWaar kan ik je mee helpen?',
        suggestions: ['Productadvies', 'Hoe werkt Scanner?', 'Bespaartips'],
      },
    ])

    // Load daily usage
    loadDailyUsage()
  }, [])

  const loadDailyUsage = async () => {
    // TODO: Implement daily usage tracking with AsyncStorage
    // For now: mock 65 messages left
    setMessagesLeft(65)
  }

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText) return

    if (messagesLeft <= 0) {
      Alert.alert(
        '⚠️ Dagelijkse limiet bereikt',
        'Je hebt je dagelijkse limiet bereikt (65/65 berichten). Probeer morgen opnieuw!',
        [{ text: 'OK' }]
      )
      return
    }

    const userMessage: Message = { role: 'user', content: messageText }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setMessagesLeft((prev) => prev - 1)

    // Process user input
    const response = await processUserInput(messageText.toLowerCase())

    setTimeout(() => {
      setMessages((prev) => [...prev, response])
      setIsLoading(false)
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }, 800)
  }

  const processUserInput = async (userInput: string): Promise<Message> => {
    // Off-topic detection
    const offTopicKeywords = /koken|recept|huiswerk|essay|schrijven|vertalen|gedicht|verhaal|game|sport|weer|nieuws/i

    if (offTopicKeywords.test(userInput)) {
      return {
        role: 'assistant',
        content:
          '⚠️ Sorry, ik help alleen met DealSense app en productadvies.\n\nIk kan je helpen met:\n💡 Productadvies\n📋 Garantie-informatie\n💰 Bespaartips\n📱 Scanner uitleg\n\nWaar kan ik je mee helpen?',
        suggestions: ['Productadvies', 'Hoe werkt Scanner?', 'Bespaartips'],
      }
    }

    // Intent detection
    const intents = {
      scanner: /scanner|scan|barcode|qr|product vergelijk/i,
      help: /help|hulp|hoe werkt|uitleg|wat is/i,
      packages: /pakiet|abonnement|free|plus|verschil|upgrade/i,
      usp: /waarom dealsense|verschil met|beter dan|concurrent/i,
      advice: /advies|product|bespaar|goedkoper|optimaliseer/i,
    }

    // Scanner help
    if (intents.scanner.test(userInput)) {
      return {
        role: 'assistant',
        content:
          '📱 **Hoe werkt de Scanner?**\n\n1. Klik op "Scan Barcode/QR"\n2. Richt camera op barcode\n3. Wacht op automatische scan\n4. Zie direct de beste deals!\n\n**Tips:**\n✓ Zorg voor goede verlichting\n✓ Houd camera stil\n✓ Barcode moet scherp zijn\n\nProblemen? Vraag het me!',
        suggestions: ['Productadvies', 'Wat zijn de pakketten?', 'Bespaartips'],
      }
    }

    // USP
    if (intents.usp.test(userInput)) {
      return {
        role: 'assistant',
        content:
          '🚀 **DealSense - Anders dan de rest**\n\n❌ **Andere vergelijkers:**\n• Tientallen verwarrende aanbiedingen\n• Verdienmodel: advertenties\n• Jij moet alles zelf uitzoeken\n\n✅ **DealSense:**\n• Deal Score → TOP 3 beste deals\n• Wij verdienen alleen als jij bespaart\n• Alles in één app\n• Echo helpt je persoonlijk\n\n💡 Wij werken VOOR jou, niet voor bedrijven.',
        suggestions: ['Wat zijn de pakketten?', 'Productadvies', 'Bespaartips'],
      }
    }

    // Packages
    if (intents.packages.test(userInput)) {
      return {
        role: 'assistant',
        content:
          '📦 **DealSense Pakketten:**\n\n**FREE** - €0\n• 3 gratis scans\n• Basis prijsvergelijking\n• 10% commissie\n\n**PLUS** - €19,99/mnd\n• Onbeperkt scannen\n• Echo AI assistent (jij!)\n• Ghost Mode (24h monitoring)\n• 9% commissie\n\n💡 PLUS = Unlimited + Echo + Ghost Mode',
        suggestions: ['Wat is Ghost Mode?', 'Productadvies', 'Hoe werkt het?'],
      }
    }

    // Product advice
    if (intents.advice.test(userInput)) {
      return {
        role: 'assistant',
        content:
          '💡 **Bespaartips:**\n\n1. **Scan regelmatig**\nPrijzen veranderen dagelijks!\n\n2. **Gebruik Ghost Mode**\nAutomatische monitoring als we nu niks vinden\n\n3. **Let op verzendkosten**\nSoms is iets duurder goedkoper totaal\n\n4. **Check reviews**\nGoedkoop is niet altijd beste keuze\n\nWil je specifiek productadvies?',
        suggestions: ['Productadvies', 'Wat is Ghost Mode?', 'Hoe werkt Scanner?'],
      }
    }

    // General help
    if (intents.help.test(userInput)) {
      return {
        role: 'assistant',
        content:
          '👋 **Ik help je graag!**\n\n🎯 **Populaire vragen:**\n• Hoe werkt DealSense?\n• Wat zijn de pakketten?\n• Waarom DealSense beter is?\n• Hoe gebruik ik de Scanner?\n• Wat is Ghost Mode?\n\nStel je vraag!',
        suggestions: ['Hoe werkt het?', 'Pakketten uitleg', 'Waarom DealSense?'],
      }
    }

    // Default response
    return {
      role: 'assistant',
      content:
        '👋 Ik ben Echo, je persoonlijke AI assistent!\n\n**Ik kan je helpen met:**\n💡 Productadvies op maat\n📋 Garantie-informatie\n💰 Bespaartips\n❓ Algemene vragen\n\n**Tip:** Gebruik de Scanner om producten te vergelijken!\n\nWaar kan ik je mee helpen?',
      suggestions: ['Productadvies', 'Hoe werkt Scanner?', 'Bespaartips'],
    }
  }

  const handleSuggestionPress = (suggestion: string) => {
    handleSend(suggestion)
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>💬 Echo Agent</Text>
          <Text style={styles.headerSubtitle}>
            {messagesLeft}/65 berichten vandaag
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message, index) => (
          <View key={index}>
            <View
              style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.role === 'user' ? styles.userText : styles.assistantText,
                ]}
              >
                {message.content}
              </Text>
            </View>

            {message.suggestions && message.suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {message.suggestions.map((suggestion, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.suggestionButton}
                    onPress={() => handleSuggestionPress(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}

        {isLoading && (
          <View style={[styles.messageBubble, styles.assistantBubble]}>
            <Text style={styles.assistantText}>Echo typt...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Stel je vraag..."
          placeholderTextColor={COLORS.textSecondary}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={() => handleSend()}
          disabled={!input.trim()}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: COLORS.text,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  sendButtonText: {
    fontSize: 20,
    color: '#fff',
  },
})
