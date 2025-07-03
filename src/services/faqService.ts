import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { cacheService, cacheKeys } from './cacheService';

// Temporary FAQ types until we can add them to main types file
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  order: number;
}

export interface CreateFAQData {
  question: string;
  answer: string;
  isPublished?: boolean;
}

export interface EditFAQData {
  question?: string;
  answer?: string;
  isPublished?: boolean;
  order?: number;
}

const FAQ_COLLECTION = 'faqs';

/**
 * Get all published FAQs for public viewing
 */
export const getPublishedFAQs = async (): Promise<FAQ[]> => {
  return cacheService.getOrFetch(
    cacheKeys.faqs(),
    async () => {
      try {
        const faqsQuery = query(
          collection(db, FAQ_COLLECTION),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(faqsQuery);
        const faqs: FAQ[] = [];

        querySnapshot.forEach((doc) => {
          const faqData = doc.data();
          faqs.push({
            id: doc.id,
            question: faqData.question,
            answer: faqData.answer,
            createdBy: faqData.createdBy,
            createdByName: faqData.createdByName,
            createdAt: faqData.createdAt?.toDate() || new Date(),
            updatedAt: faqData.updatedAt?.toDate() || new Date(),
            isPublished: faqData.isPublished,
            order: faqData.order || 0,
          });
        });

        return faqs
          .filter(faq => faq.isPublished)
          .sort((a, b) => a.order - b.order);
      } catch (error) {
        console.error('Error fetching published FAQs:', error);
        throw new Error('Failed to fetch FAQs');
      }
    },
    60 * 24 // cache for 24 hours
  );
};

/**
 * Get all FAQs for admin management (includes drafts)
 */
export const getAllFAQs = async (): Promise<FAQ[]> => {
  // Admin view - do not cache aggressively; still cache 5 minutes
  return cacheService.getOrFetch(
    `${cacheKeys.faqs()}_admin`,
    async () => {
      try {
        const faqsQuery = query(
          collection(db, FAQ_COLLECTION),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(faqsQuery);
        const faqs: FAQ[] = [];

        querySnapshot.forEach((doc) => {
          const faqData = doc.data();
          faqs.push({
            id: doc.id,
            question: faqData.question,
            answer: faqData.answer,
            createdBy: faqData.createdBy,
            createdByName: faqData.createdByName,
            createdAt: faqData.createdAt?.toDate() || new Date(),
            updatedAt: faqData.updatedAt?.toDate() || new Date(),
            isPublished: faqData.isPublished,
            order: faqData.order || 0,
          });
        });

        return faqs.sort((a, b) => a.order - b.order);
      } catch (error) {
        console.error('Error fetching all FAQs:', error);
        throw new Error('Failed to fetch FAQs');
      }
    },
    5 // cache 5 minutes
  );
};

/**
 * Create a new FAQ (admin only)
 */
export const createFAQ = async (
  faqData: CreateFAQData,
  userId: string,
  userName: string
): Promise<string> => {
  try {
    // Get the current highest order number
    const allFaqs = await getAllFAQs();
    const maxOrder = allFaqs.length > 0 ? Math.max(...allFaqs.map(faq => faq.order)) : 0;

    const newFAQ = {
      question: faqData.question,
      answer: faqData.answer,
      createdBy: userId,
      createdByName: userName,
      isPublished: faqData.isPublished || false,
      order: maxOrder + 1,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, FAQ_COLLECTION), newFAQ);
    console.log('FAQ created with ID:', docRef.id);

    // Invalidate FAQ caches
    cacheService.remove(cacheKeys.faqs()).catch(() => {});
    cacheService.remove(`${cacheKeys.faqs()}_admin`).catch(() => {});

    return docRef.id;
  } catch (error) {
    console.error('Error creating FAQ:', error);
    throw new Error('Failed to create FAQ');
  }
};

/**
 * Update an existing FAQ (admin only)
 */
export const updateFAQ = async (faqId: string, updates: EditFAQData): Promise<void> => {
  try {
    const faqRef = doc(db, FAQ_COLLECTION, faqId);
    await updateDoc(faqRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    
    console.log('FAQ updated:', faqId);

    // Invalidate FAQ caches
    cacheService.remove(cacheKeys.faqs()).catch(() => {});
    cacheService.remove(`${cacheKeys.faqs()}_admin`).catch(() => {});
  } catch (error) {
    console.error('Error updating FAQ:', error);
    throw new Error('Failed to update FAQ');
  }
};

/**
 * Delete a FAQ (admin only)
 */
export const deleteFAQ = async (faqId: string): Promise<void> => {
  try {
    const faqRef = doc(db, FAQ_COLLECTION, faqId);
    await deleteDoc(faqRef);
    
    console.log('FAQ deleted:', faqId);

    // Invalidate FAQ caches
    cacheService.remove(cacheKeys.faqs()).catch(() => {});
    cacheService.remove(`${cacheKeys.faqs()}_admin`).catch(() => {});
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    throw new Error('Failed to delete FAQ');
  }
};

/**
 * Reorder FAQs (admin only)
 */
export const reorderFAQs = async (faqs: FAQ[]): Promise<void> => {
  try {
    const promises = faqs.map((faq, index) =>
      updateDoc(doc(db, FAQ_COLLECTION, faq.id), {
        order: index + 1,
        updatedAt: serverTimestamp(),
      })
    );

    await Promise.all(promises);
    console.log('FAQs reordered successfully');

    // Invalidate FAQ caches
    cacheService.remove(cacheKeys.faqs()).catch(() => {});
    cacheService.remove(`${cacheKeys.faqs()}_admin`).catch(() => {});
  } catch (error) {
    console.error('Error reordering FAQs:', error);
    throw new Error('Failed to reorder FAQs');
  }
};

/**
 * Get FAQ statistics (admin only)
 */
export const getFAQStats = async (): Promise<{
  totalFAQs: number;
  publishedFAQs: number;
  draftFAQs: number;
}> => {
  try {
    const allFaqs = await getAllFAQs();
    
    return {
      totalFAQs: allFaqs.length,
      publishedFAQs: allFaqs.filter(faq => faq.isPublished).length,
      draftFAQs: allFaqs.filter(faq => !faq.isPublished).length,
    };
  } catch (error) {
    console.error('Error fetching FAQ stats:', error);
    throw new Error('Failed to fetch FAQ statistics');
  }
};

/**
 * Create default FAQs for initial setup (admin only)
 */
export const createDefaultFAQs = async (userId: string, userName: string): Promise<void> => {
  try {
    const defaultFAQs = [
      {
        question: "What is the Seattle Chinatown Book Club?",
        answer: "The Seattle Chinatown Book Club is a community-driven book club that focuses on celebrating literature and fostering connections within the Seattle Chinatown community. We meet regularly to discuss books, share perspectives, and build lasting friendships through our shared love of reading.",
        isPublished: true,
      },
      {
        question: "How often do we meet?",
        answer: "We typically meet once a month to discuss our current book selection. Meeting dates and times are posted in the Events section of the app. We also host special events and author talks throughout the year.",
        isPublished: true,
      },
      {
        question: "How are books selected?",
        answer: "Our monthly book selections are chosen by the club organizers with input from members. We aim to feature a diverse range of authors and genres, with a special focus on Asian American literature and stories that resonate with our community.",
        isPublished: true,
      },
      {
        question: "Do I need to read the entire book to attend?",
        answer: "While we encourage reading the full book for the best discussion experience, you're welcome to attend even if you haven't finished. We try to structure discussions to avoid major spoilers early on, and partial participation is better than no participation!",
        isPublished: true,
      },
      {
        question: "Are there membership fees?",
        answer: "No, the Seattle Chinatown Book Club is completely free to join. You only need to purchase or borrow the books we're reading. We often share information about where to find books at local libraries or bookstores.",
        isPublished: true,
      },
      {
        question: "How do I RSVP for events?",
        answer: "You can RSVP for events directly through this app! Just go to the Events section, find the event you want to attend, and tap on it to view details and RSVP. You can change your RSVP status anytime before the event.",
        isPublished: true,
      },
      {
        question: "Can I suggest books for future reading?",
        answer: "Absolutely! We love hearing book suggestions from our members. You can share your recommendations during our meetings, or contact us through the Feedback section of this app. We keep a running list of member suggestions for future selections.",
        isPublished: true,
      },
      {
        question: "What if I can't attend a meeting?",
        answer: "No worries! While we'd love to see you at every meeting, we understand that life happens. You can stay connected by reading along with us and joining future discussions. We also sometimes share meeting highlights or discussion points in our community updates.",
        isPublished: true,
      }
    ];

    // Check if any FAQs already exist to avoid duplicates
    const existingFAQs = await getAllFAQs();
    if (existingFAQs.length > 0) {
      console.log('FAQs already exist, skipping default creation');
      return;
    }

    // Create each default FAQ
    for (let i = 0; i < defaultFAQs.length; i++) {
      const faqData = {
        ...defaultFAQs[i],
        order: i + 1,
      };
      await createFAQ(faqData, userId, userName);
    }

    console.log('Default FAQs created successfully');
  } catch (error) {
    console.error('Error creating default FAQs:', error);
    throw new Error('Failed to create default FAQs');
  }
}; 