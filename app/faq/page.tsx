"use client"

import { useTranslation } from "@/lib/i18n/translation-context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQPage() {
  const { t } = useTranslation()

  // FAQ items - in a real app, these would be translated too
  const faqItems = [
    {
      question: "What is Free Cabins Europe?",
      answer:
        "Free Cabins Europe is a platform that maps and provides information about free or low-cost cabins, shelters, and bivouacs across Europe. These structures provide essential shelter for hikers, mountaineers, and outdoor enthusiasts.",
    },
    {
      question: "Are all the cabins really free?",
      answer:
        "Most of the cabins listed are free to use, but some may require a small fee or donation. Each cabin listing indicates whether booking is required and provides details about any costs.",
    },
    {
      question: "How accurate is the information?",
      answer:
        "We strive to maintain accurate and up-to-date information. Each cabin listing shows when it was last updated. However, conditions can change, so we recommend verifying information before planning a trip.",
    },
    {
      question: "Can I contribute information about a cabin?",
      answer:
        "Yes! We welcome community contributions. If you know of a free cabin that isn't in our database, or if you have updated information about an existing entry, please contact us.",
    },
    {
      question: "How do I find cabins in a specific area?",
      answer:
        "Use the map view to explore cabins visually, or use the filters to narrow down by country, region, amenities, and other criteria.",
    },
    {
      question: "What amenities do these cabins typically have?",
      answer:
        "Amenities vary widely. Some cabins are basic shelters with just a roof and walls, while others may have water, toilets, fireplaces, or even cooking facilities. Each cabin listing details the available amenities.",
    },
    {
      question: "Do I need to book these cabins in advance?",
      answer:
        "It depends on the cabin. Some require advance booking, while others are first-come, first-served. The cabin details indicate whether booking is required.",
    },
    {
      question: "What should I bring when staying at a free cabin?",
      answer:
        "Always bring a sleeping bag, food, water, and appropriate clothing. Most cabins have minimal amenities, so be prepared to be self-sufficient. A headlamp or flashlight, first aid kit, and map are also essential. Check the cabin details for specific information about what's available.",
    },
    {
      question: "Are these cabins maintained?",
      answer:
        "Maintenance varies. Some cabins are regularly maintained by alpine clubs or local organizations, while others may receive minimal upkeep. Always follow the principle of leaving the cabin in better condition than you found it.",
    },
    {
      question: "Can I use these cabins year-round?",
      answer:
        "Accessibility varies by cabin and season. Some high-altitude cabins may be inaccessible or dangerous to reach in winter. Check the cabin details and local conditions before planning your trip.",
    },
    {
      question: "How many people can stay in a cabin?",
      answer:
        "Capacity varies widely, from small bivouacs that fit 2-4 people to larger refuges that can accommodate 20 or more. Each cabin listing indicates its capacity.",
    },
    {
      question: "Is it safe to stay in these cabins?",
      answer:
        "Generally yes, but as with any outdoor activity, there are inherent risks. Be prepared for emergencies, let someone know your plans, and check weather conditions before setting out.",
    },
    {
      question: "Are pets allowed in these cabins?",
      answer:
        "Policies vary by cabin. Some allow pets, while others prohibit them. If this information isn't provided in the cabin details, it's best to assume pets are not allowed or to check with the managing organization.",
    },
    {
      question: "Can I make a fire at these cabins?",
      answer:
        "Some cabins have fireplaces or stoves, but always check if firewood is provided and follow all fire safety rules. Never make fires outside designated areas, and be aware of local fire restrictions.",
    },
    {
      question: "How do I get to these cabins?",
      answer:
        "Most cabins require hiking to reach them. The difficulty and length of the approach vary widely. Use the map and coordinates provided to plan your route.",
    },
    {
      question: "What's the difference between a bivouac, refuge, and shelter?",
      answer:
        "A bivouac is typically a small, basic shelter. A refuge is usually larger and may offer more amenities. Shelter is a general term that can refer to various types of structures. The cabin type is indicated in each listing.",
    },
    {
      question: "Is there cell phone reception at these cabins?",
      answer:
        "Reception varies by location. Many remote cabins have no cell service. Always plan as if you won't have reception and be self-sufficient.",
    },
    {
      question: "What should I do in case of emergency?",
      answer:
        "Know the local emergency number (112 works throughout Europe). Carry a first aid kit and know basic first aid. If possible, carry a satellite communication device in remote areas.",
    },
    {
      question: "How can I support the maintenance of these cabins?",
      answer:
        "Leave a donation if there's a donation box, clean up after yourself, bring out all trash, and report any issues to the managing organization. Consider joining or donating to alpine clubs that maintain these structures.",
    },
    {
      question: "Are there any rules I should follow when using these cabins?",
      answer:
        "Yes: leave the cabin clean, don't damage anything, be considerate of other users, follow any posted rules, pack out all trash, and close everything properly when leaving.",
    },
    {
      question: "How far in advance should I plan my trip?",
      answer:
        "For cabins that require booking, check the specific requirements. For others, it's still good to plan ahead to check weather conditions, trail status, and any seasonal closures.",
    },
  ]

  return (
    <div className="container py-8 px-6 md:px-8">
      <h1 className="text-3xl font-bold mb-6">{t("common.faq")}</h1>

      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
