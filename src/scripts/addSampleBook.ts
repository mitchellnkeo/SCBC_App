import { monthlyBookService } from '../services/monthlyBookService';

const addSampleBook = async () => {
  try {
    const sampleBook = {
      month: "January 2024",
      title: "The Seven Moons of Maali Almeida",
      author: "Shehan Karunatilaka",
      description: "A darkly comic fantasy novel that follows Maali Almeida, a photographer who wakes up dead and has seven moons to solve his own murder and save his friends from a similar fate.",
      genre: "Fantasy, Literary Fiction",
      pages: 416,
      publishedYear: 2022,
      awards: ["2022 Booker Prize Winner"],
      whySelected: "This Booker Prize-winning novel offers a unique perspective on Sri Lankan history and culture, blending magical realism with social commentary in a way that aligns perfectly with our focus on diverse AANHPI voices.",
      discussionSheetUrl: "https://docs.google.com/document/d/your-discussion-sheet-id/edit?usp=sharing",
    };

    const bookId = await monthlyBookService.createMonthlyBook(sampleBook);
    console.log('Sample book created with ID:', bookId);
  } catch (error) {
    console.error('Error creating sample book:', error);
  }
};

export { addSampleBook }; 