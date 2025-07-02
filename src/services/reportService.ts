import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp,
  startAfter,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Report, 
  CreateReportData, 
  ReportStatus, 
  ReportStats,
  ReportType,
  ReportReason 
} from '../types';
import { createNotification } from './internalNotificationService';
import { getAllUsers } from './userService';

const REPORTS_COLLECTION = 'reports';

/**
 * Submit a new report
 */
export const submitReport = async (
  reporterId: string,
  reporterName: string,
  reportData: CreateReportData
): Promise<string> => {
  try {
    const report = {
      ...reportData,
      status: 'pending' as ReportStatus,
      reporterId,
      reporterName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, REPORTS_COLLECTION), report);
    console.log('Report submitted:', docRef.id);

    // Notify all admins about the new report
    await notifyAdminsOfNewReport(docRef.id, reportData, reporterName);

    return docRef.id;
  } catch (error) {
    console.error('Error submitting report:', error);
    throw new Error('Failed to submit report');
  }
};

/**
 * Get all reports with optional filtering and pagination
 */
export const getReports = async (
  options: {
    status?: ReportStatus;
    type?: ReportType;
    limitCount?: number;
    lastVisible?: any;
  } = {}
): Promise<{ reports: Report[]; lastVisible: any }> => {
  try {
    const constraints: QueryConstraint[] = [
      orderBy('createdAt', 'desc')
    ];

    if (options.status) {
      constraints.push(where('status', '==', options.status));
    }

    if (options.type) {
      constraints.push(where('type', '==', options.type));
    }

    if (options.limitCount) {
      constraints.push(limit(options.limitCount));
    }

    if (options.lastVisible) {
      constraints.push(startAfter(options.lastVisible));
    }

    const reportsQuery = query(collection(db, REPORTS_COLLECTION), ...constraints);
    const snapshot = await getDocs(reportsQuery);

    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      resolvedAt: doc.data().resolvedAt?.toDate(),
    })) as Report[];

    const lastVisible = snapshot.docs[snapshot.docs.length - 1];

    return { reports, lastVisible };
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw new Error('Failed to fetch reports');
  }
};

/**
 * Get a specific report by ID
 */
export const getReport = async (reportId: string): Promise<Report | null> => {
  try {
    const reportDoc = await getDoc(doc(db, REPORTS_COLLECTION, reportId));
    
    if (!reportDoc.exists()) {
      return null;
    }

    const data = reportDoc.data();
    return {
      id: reportDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      resolvedAt: data.resolvedAt?.toDate(),
    } as Report;
  } catch (error) {
    console.error('Error fetching report:', error);
    throw new Error('Failed to fetch report');
  }
};

/**
 * Update report status (admin action)
 */
export const updateReportStatus = async (
  reportId: string,
  status: ReportStatus,
  adminId: string,
  adminName: string,
  adminNotes?: string,
  resolutionAction?: string
): Promise<void> => {
  try {
    const updateData: any = {
      status,
      assignedAdminId: adminId,
      assignedAdminName: adminName,
      updatedAt: serverTimestamp(),
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    if (resolutionAction) {
      updateData.resolutionAction = resolutionAction;
    }

    if (status === 'resolved' || status === 'dismissed') {
      updateData.resolvedAt = serverTimestamp();
      
      // Notify the reporter about the resolution
      const report = await getReport(reportId);
      if (report) {
        await notifyReporterOfResolution(report, status, resolutionAction);
      }
    }

    await updateDoc(doc(db, REPORTS_COLLECTION, reportId), updateData);
    console.log('Report status updated:', reportId, status);
  } catch (error) {
    console.error('Error updating report status:', error);
    throw new Error('Failed to update report status');
  }
};

/**
 * Get report statistics
 */
export const getReportStats = async (): Promise<ReportStats> => {
  try {
    const allReportsQuery = query(collection(db, REPORTS_COLLECTION));
    const snapshot = await getDocs(allReportsQuery);

    const stats: ReportStats = {
      totalReports: 0,
      pendingReports: 0,
      investigatingReports: 0,
      resolvedReports: 0,
      dismissedReports: 0,
      reportsThisWeek: 0,
    };

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate() || new Date();
      
      stats.totalReports++;
      
      switch (data.status) {
        case 'pending':
          stats.pendingReports++;
          break;
        case 'investigating':
          stats.investigatingReports++;
          break;
        case 'resolved':
          stats.resolvedReports++;
          break;
        case 'dismissed':
          stats.dismissedReports++;
          break;
      }

      if (createdAt >= oneWeekAgo) {
        stats.reportsThisWeek++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching report stats:', error);
    throw new Error('Failed to fetch report stats');
  }
};

/**
 * Get reports submitted by a specific user
 */
export const getUserReports = async (userId: string): Promise<Report[]> => {
  try {
    const userReportsQuery = query(
      collection(db, REPORTS_COLLECTION),
      where('reporterId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(userReportsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      resolvedAt: doc.data().resolvedAt?.toDate(),
    })) as Report[];
  } catch (error) {
    console.error('Error fetching user reports:', error);
    throw new Error('Failed to fetch user reports');
  }
};

/**
 * Subscribe to reports with real-time updates
 */
export const subscribeToReports = (
  callback: (reports: Report[]) => void,
  options: {
    status?: ReportStatus;
    type?: ReportType;
    limitCount?: number;
  } = {}
) => {
  const constraints: QueryConstraint[] = [
    orderBy('createdAt', 'desc')
  ];

  if (options.status) {
    constraints.push(where('status', '==', options.status));
  }

  if (options.type) {
    constraints.push(where('type', '==', options.type));
  }

  if (options.limitCount) {
    constraints.push(limit(options.limitCount));
  }

  const reportsQuery = query(collection(db, REPORTS_COLLECTION), ...constraints);
  
  return onSnapshot(reportsQuery, (snapshot) => {
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      resolvedAt: doc.data().resolvedAt?.toDate(),
    })) as Report[];
    
    callback(reports);
  });
};

/**
 * Check if user has already reported specific content
 */
export const hasUserReportedContent = async (
  userId: string,
  contentId: string,
  contentType: ReportType
): Promise<boolean> => {
  try {
    const existingReportQuery = query(
      collection(db, REPORTS_COLLECTION),
      where('reporterId', '==', userId),
      where('contentId', '==', contentId),
      where('type', '==', contentType),
      limit(1)
    );
    
    const snapshot = await getDocs(existingReportQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking existing report:', error);
    return false; // Default to allowing report if check fails
  }
};

/**
 * Get report reason display name
 */
export const getReportReasonDisplay = (reason: ReportReason): string => {
  switch (reason) {
    case 'inappropriate_content':
      return 'Inappropriate Content';
    case 'harassment':
      return 'Harassment';
    case 'spam':
      return 'Spam';
    case 'hate_speech':
      return 'Hate Speech';
    case 'misinformation':
      return 'Misinformation';
    case 'violence':
      return 'Violence';
    case 'other':
      return 'Other';
    default:
      return 'Unknown';
  }
};

/**
 * Get report type display name
 */
export const getReportTypeDisplay = (type: ReportType): string => {
  switch (type) {
    case 'profile':
      return 'Profile';
    case 'comment':
      return 'Comment';
    case 'event':
      return 'Event';
    default:
      return 'Unknown';
  }
};

/**
 * Helper function to notify admins of new reports
 */
const notifyAdminsOfNewReport = async (
  reportId: string,
  reportData: CreateReportData,
  reporterName: string
): Promise<void> => {
  try {
    // Get all admin users
    const allUsers = await getAllUsers();
    const adminUsers = allUsers.filter(user => user.role === 'admin');

    // Create notifications for all admins
    const notificationPromises = adminUsers.map(admin =>
      createNotification({
        userId: admin.id,
        type: 'new_report',
        title: 'New Content Report',
        message: `${reporterName} reported ${getReportTypeDisplay(reportData.type).toLowerCase()}: "${reportData.contentPreview}"`,
        data: {
          newReport: {
            reportId,
            reportType: getReportTypeDisplay(reportData.type),
            contentPreview: reportData.contentPreview,
            reporterName,
          }
        },
        fromUserId: reportData.contentOwnerId,
        fromUserName: reporterName,
      })
    );

    await Promise.all(notificationPromises);
    console.log(`Notified ${adminUsers.length} admins of new report`);
  } catch (error) {
    console.error('Error notifying admins of new report:', error);
  }
};

/**
 * Helper function to notify reporter of resolution
 */
const notifyReporterOfResolution = async (
  report: Report,
  status: ReportStatus,
  resolutionAction?: string
): Promise<void> => {
  try {
    const resolution = status === 'resolved' ? 
      (resolutionAction || 'The reported content has been reviewed and appropriate action has been taken.') :
      'The report has been reviewed and dismissed.';

    await createNotification({
      userId: report.reporterId,
      type: 'report_resolved',
      title: 'Report Update',
      message: `Your report about ${getReportTypeDisplay(report.type).toLowerCase()} has been ${status}.`,
      data: {
        reportResolved: {
          reportId: report.id,
          reportType: getReportTypeDisplay(report.type),
          contentPreview: report.contentPreview,
          resolution,
        }
      },
    });

    console.log('Notified reporter of resolution:', report.reporterId);
  } catch (error) {
    console.error('Error notifying reporter of resolution:', error);
  }
}; 