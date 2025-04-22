import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Starter, StarterStatus, FeedingRecord } from '../types/Starter';

const STARTERS_COLLECTION = 'starters';
const FEEDING_RECORDS_COLLECTION = 'feedingRecords';

// Starter CRUD operations
export const fetchStarters = async (userId: string): Promise<Starter[]> => {
  try {
    const startersQuery = query(collection(db, STARTERS_COLLECTION), where('createdBy', '==', userId));
    const querySnapshot = await getDocs(startersQuery);
    
    return Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
      const data = docSnapshot.data();
      
      // Fetch feeding records for this starter
      const feedingRecordsQuery = query(
        collection(db, FEEDING_RECORDS_COLLECTION), 
        where('starterId', '==', docSnapshot.id)
      );
      const feedingRecordsSnapshot = await getDocs(feedingRecordsQuery);
      
      const feedingHistory = feedingRecordsSnapshot.docs.map(recordDoc => {
        const recordData = recordDoc.data();
        return {
          id: recordDoc.id,
          date: recordData.date.toDate(),
          flourType: recordData.flourType,
          flourAmount: recordData.flourAmount,
          waterAmount: recordData.waterAmount,
          starterAmount: recordData.starterAmount,
          temperature: recordData.temperature,
          notes: recordData.notes,
          activityRating: recordData.activityRating,
          images: recordData.images
        } as FeedingRecord;
      });
      
      return {
        id: docSnapshot.id,
        name: data.name,
        description: data.description,
        dateCreated: data.dateCreated.toDate(),
        lastFeedingDate: data.lastFeedingDate.toDate(),
        feedingSchedule: data.feedingSchedule,
        hydration: data.hydration,
        status: data.status,
        notes: data.notes,
        feedingHistory,
        createdBy: data.createdBy
      } as Starter;
    }));
  } catch (error) {
    console.error('Error fetching starters:', error);
    throw error;
  }
};

export const createStarter = async (starter: Starter, userId: string): Promise<string> => {
  try {
    // Create starter without feeding history
    const { feedingHistory, ...starterData } = starter;
    
    const starterToSave = {
      ...starterData,
      createdBy: userId,
      dateCreated: Timestamp.fromDate(new Date(starter.dateCreated)),
      lastFeedingDate: Timestamp.fromDate(new Date(starter.lastFeedingDate))
    };
    
    const docRef = await addDoc(collection(db, STARTERS_COLLECTION), starterToSave);
    
    // Add feeding records separately
    if (feedingHistory && feedingHistory.length > 0) {
      await Promise.all(feedingHistory.map(record => 
        addFeedingRecord(docRef.id, record)
      ));
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating starter:', error);
    throw error;
  }
};

export const updateStarter = async (starter: Starter): Promise<void> => {
  if (!starter.id) {
    throw new Error('Starter ID is required for update');
  }
  
  try {
    const starterRef = doc(db, STARTERS_COLLECTION, starter.id);
    
    // Update starter without feeding history
    const { feedingHistory, ...starterData } = starter;
    
    const starterToUpdate = {
      ...starterData,
      dateCreated: Timestamp.fromDate(new Date(starter.dateCreated)),
      lastFeedingDate: Timestamp.fromDate(new Date(starter.lastFeedingDate))
    };
    
    // Remove id from the data as it's not stored in the document
    delete starterToUpdate.id;
    
    await updateDoc(starterRef, starterToUpdate);
    
    // Feeding records are managed separately through addFeedingRecord, updateFeedingRecord, deleteFeedingRecord
  } catch (error) {
    console.error('Error updating starter:', error);
    throw error;
  }
};

export const deleteStarter = async (starterId: string): Promise<void> => {
  try {
    // Delete the starter
    const starterRef = doc(db, STARTERS_COLLECTION, starterId);
    await deleteDoc(starterRef);
    
    // Delete all feeding records for this starter
    const feedingRecordsQuery = query(
      collection(db, FEEDING_RECORDS_COLLECTION), 
      where('starterId', '==', starterId)
    );
    const querySnapshot = await getDocs(feedingRecordsQuery);
    
    await Promise.all(querySnapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, FEEDING_RECORDS_COLLECTION, docSnapshot.id))
    ));
  } catch (error) {
    console.error('Error deleting starter:', error);
    throw error;
  }
};

export const updateStarterStatus = async (starterId: string, status: StarterStatus): Promise<void> => {
  try {
    const starterRef = doc(db, STARTERS_COLLECTION, starterId);
    await updateDoc(starterRef, { status });
  } catch (error) {
    console.error('Error updating starter status:', error);
    throw error;
  }
};

// Feeding Record CRUD operations
export const addFeedingRecord = async (starterId: string, record: FeedingRecord): Promise<string> => {
  try {
    const recordData = {
      ...record,
      starterId,
      date: Timestamp.fromDate(new Date(record.date))
    };
    
    // Remove id if it exists
    if (recordData.id) {
      delete recordData.id;
    }
    
    const docRef = await addDoc(collection(db, FEEDING_RECORDS_COLLECTION), recordData);
    
    // Update the starter's lastFeedingDate
    const starterRef = doc(db, STARTERS_COLLECTION, starterId);
    await updateDoc(starterRef, {
      lastFeedingDate: Timestamp.fromDate(new Date(record.date))
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding feeding record:', error);
    throw error;
  }
};

export const updateFeedingRecord = async (starterId: string, recordId: string, record: FeedingRecord): Promise<void> => {
  try {
    const recordRef = doc(db, FEEDING_RECORDS_COLLECTION, recordId);
    
    const recordData = {
      ...record,
      starterId,
      date: Timestamp.fromDate(new Date(record.date))
    };
    
    // Remove id from the data as it's not stored in the document
    delete recordData.id;
    
    await updateDoc(recordRef, recordData);
    
    // Check if we need to update the starter's lastFeedingDate
    // This requires fetching all feeding records to find the most recent one
    const feedingRecordsQuery = query(
      collection(db, FEEDING_RECORDS_COLLECTION), 
      where('starterId', '==', starterId)
    );
    const querySnapshot = await getDocs(feedingRecordsQuery);
    
    let mostRecentDate: Date | null = null;
    
    querySnapshot.docs.forEach(doc => {
      const recordData = doc.data();
      const recordDate = recordData.date.toDate();
      
      if (!mostRecentDate || recordDate > mostRecentDate) {
        mostRecentDate = recordDate;
      }
    });
    
    if (mostRecentDate) {
      const starterRef = doc(db, STARTERS_COLLECTION, starterId);
      await updateDoc(starterRef, {
        lastFeedingDate: Timestamp.fromDate(mostRecentDate)
      });
    }
  } catch (error) {
    console.error('Error updating feeding record:', error);
    throw error;
  }
};

export const deleteFeedingRecord = async (starterId: string, recordId: string): Promise<void> => {
  try {
    // Delete the feeding record
    const recordRef = doc(db, FEEDING_RECORDS_COLLECTION, recordId);
    await deleteDoc(recordRef);
    
    // Update the starter's lastFeedingDate to the most recent remaining feeding
    const feedingRecordsQuery = query(
      collection(db, FEEDING_RECORDS_COLLECTION), 
      where('starterId', '==', starterId)
    );
    const querySnapshot = await getDocs(feedingRecordsQuery);
    
    let mostRecentDate: Date | null = null;
    
    querySnapshot.docs.forEach(doc => {
      const recordData = doc.data();
      const recordDate = recordData.date.toDate();
      
      if (!mostRecentDate || recordDate > mostRecentDate) {
        mostRecentDate = recordDate;
      }
    });
    
    if (mostRecentDate) {
      const starterRef = doc(db, STARTERS_COLLECTION, starterId);
      await updateDoc(starterRef, {
        lastFeedingDate: Timestamp.fromDate(mostRecentDate)
      });
    }
  } catch (error) {
    console.error('Error deleting feeding record:', error);
    throw error;
  }
};
