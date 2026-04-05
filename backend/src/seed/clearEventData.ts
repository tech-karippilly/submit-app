import mongoose from 'mongoose';
import { connectDB } from '../config/database';

/**
 * Clear all event-related data from the database
 * This includes: Events, Participants, Invoices, Transactions, Enquiries
 */
const clearEventData = async (): Promise<void> => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('\n=== Starting Event Data Cleanup ===\n');

    // Get all collections
    const collections = mongoose.connection.collections;

    // Delete in order to avoid foreign key issues
    // 1. Transactions (references Participants and Events)
    if (collections['transactions']) {
      const txnResult = await mongoose.connection.collection('transactions').deleteMany({});
      console.log(`✓ Deleted ${txnResult.deletedCount} transactions`);
    }

    // 2. Invoices (references Participants and Events)
    if (collections['invoices']) {
      const invResult = await mongoose.connection.collection('invoices').deleteMany({});
      console.log(`✓ Deleted ${invResult.deletedCount} invoices`);
    }

    // 3. Participants (references Events)
    if (collections['participants']) {
      const partResult = await mongoose.connection.collection('participants').deleteMany({});
      console.log(`✓ Deleted ${partResult.deletedCount} participants`);
    }

    // 4. Enquiries (may reference Events)
    if (collections['enquiries']) {
      const enqResult = await mongoose.connection.collection('enquiries').deleteMany({});
      console.log(`✓ Deleted ${enqResult.deletedCount} enquiries`);
    }

    // 5. Events (main entity)
    if (collections['events']) {
      const eventResult = await mongoose.connection.collection('events').deleteMany({});
      console.log(`✓ Deleted ${eventResult.deletedCount} events`);
    }

    // 6. Event Types (optional - uncomment if needed)
    // if (collections['eventtypes']) {
    //   const typeResult = await mongoose.connection.collection('eventtypes').deleteMany({});
    //   console.log(`✓ Deleted ${typeResult.deletedCount} event types`);
    // }

    // 7. Speakers (optional - uncomment if needed)
    // if (collections['speakers']) {
    //   const speakerResult = await mongoose.connection.collection('speakers').deleteMany({});
    //   console.log(`✓ Deleted ${speakerResult.deletedCount} speakers`);
    // }

    console.log('\n=== Event Data Cleanup Complete ===');
    console.log('\nNote: The following data was preserved:');
    console.log('  - Users/Admins');
    console.log('  - Email Templates');
    console.log('  - Email Icons');
    console.log('  - About content');
    console.log('  - Contact submissions');
    console.log('  - Testimonials');
    console.log('  - Sponsors/Partners');
    console.log('  - Founders');
    console.log('  - Hero/Carousel data');
    console.log('  - Policies');

  } catch (error) {
    console.error('\n❌ Error clearing event data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  clearEventData();
}

export default clearEventData;
