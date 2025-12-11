const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();

// --- ฟังก์ชันสำหรับจัดการผู้ใช้ ---

// สร้างผู้ใช้ใหม่ทีละคน (ต้องใช้แผน Blaze)
exports.createUser = functions.https.onCall(async (data, context) => {
  const { email, password, fullName, studentId } = data;
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: fullName,
    });
    await admin.firestore().collection("users").doc(userRecord.uid).set({
      fullName: fullName || '',
      studentId: studentId || '',
      isAdmin: false,
    });
    return { result: `Successfully created user ${email}` };
  } catch (error) {
    console.error("Error creating new user:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Import ผู้ใช้จากไฟล์ CSV (ต้องใช้แผน Blaze)
exports.importUsers = functions.https.onCall(async (data, context) => {
  if (!Array.isArray(data)) {
    throw new functions.https.HttpsError("invalid-argument", "Data must be an array.");
  }
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  for (const user of data) {
    try {
      const userRecord = await admin.auth().createUser({
        email: user.email,
        password: user.password,
        displayName: user.fullName,
      });
      await admin.firestore().collection("users").doc(userRecord.uid).set({
        fullName: user.fullName || '',
        studentId: user.studentId || '',
        isAdmin: false,
      });
      successCount++;
    } catch (error) {
      errorCount++;
      errors.push(`Failed to import ${user.email}: ${error.message}`);
    }
  }
  return {
    message: `Import finished. Success: ${successCount}, Failed: ${errorCount}`,
    errors: errors,
  };
});

// อัปเดตรหัสผ่านของผู้ใช้ (ต้องใช้แผน Blaze)
exports.updateUserPassword = functions.https.onCall(async (data, context) => {
  const { uid, newPassword } = data;
  if (!uid || !newPassword) {
    throw new functions.https.HttpsError("invalid-argument", "ต้องมี uid และ newPassword");
  }
  try {
    await admin.auth().updateUser(uid, {
      password: newPassword,
    });
    return { result: "อัปเดตรหัสผ่านสำเร็จแล้ว" };
  } catch (error) {
    console.error("Error updating password:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});


// --- ฟังก์ชันสำหรับจัดการข้อมูล ---

// ลงทะเบียนกิจกรรมกลุ่ม (ต้องใช้แผน Blaze)
exports.bulkAddCompletedActivities = functions.https.onCall(async (data, context) => {
  const { activityData, studentUids } = data;
  if (!activityData || !Array.isArray(studentUids) || studentUids.length === 0) {
    throw new functions.https.HttpsError("invalid-argument", "ข้อมูลไม่ถูกต้อง");
  }
  let successCount = 0;
  let errorCount = 0;
  const activityPayload = {
    activityName: activityData.activityName,
    hours: activityData.hours,
    completedDate: admin.firestore.Timestamp.fromDate(new Date(activityData.completedDate)),
  };
  for (const uid of studentUids) {
    try {
      const activityRef = admin.firestore().collection('users').doc(uid).collection('completedActivities');
      await activityRef.add(activityPayload);
      successCount++;
    } catch (error) {
      console.error(`Failed to add activity for user ${uid}:`, error);
      errorCount++;
    }
  }
  return { 
    message: `บันทึกกิจกรรมสำเร็จ: ${successCount} คน, ล้มเหลว: ${errorCount} คน` 
  };
});

// ลงทะเบียนรายวิชากลุ่ม (ต้องใช้แผน Blaze)
exports.bulkRegisterCourses = functions.https.onCall(async (data, context) => {
    const { courseIds, studentUids } = data;
    if (!Array.isArray(courseIds) || !Array.isArray(studentUids)) {
        throw new functions.https.HttpsError("invalid-argument", "ข้อมูลไม่ถูกต้อง");
    }
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const courseRefs = courseIds.map((id) => admin.firestore().collection("courses").doc(id));
    const courseDocs = await admin.firestore().getAll(...courseRefs);
    const coursesById = {};
    courseDocs.forEach((doc) => {
        if (doc.exists) {
            coursesById[doc.id] = doc.data();
        }
    });
    for (const uid of studentUids) {
        for (const courseId of courseIds) {
            try {
                const courseData = coursesById[courseId];
                if (courseData) {
                    const enrollmentRef = admin.firestore().collection("users").doc(uid).collection("enrolledCourses").doc(courseId);
                    await enrollmentRef.set({
                        subjectName: courseData.subjectName,
                        teacherName: courseData.teacherName,
                    });
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                errorCount++;
                errors.push(`Error for student ${uid} & course ${courseId}: ${error.message}`);
            }
        }
    }
    return { 
        message: `ลงทะเบียนเสร็จสิ้น! สำเร็จ: ${successCount} รายการ, ล้มเหลว: ${errorCount} รายการ`,
        errors: errors,
    };
});

// Import คำถามจากไฟล์ (ต้องใช้แผน Blaze)
exports.importQuestions = functions.https.onCall(async (data, context) => {
    const { examId, questions } = data;
    if (!examId || !Array.isArray(questions)) {
        throw new functions.https.HttpsError("invalid-argument", "Missing examId or questions array.");
    }
    const collectionRef = admin.firestore().collection('exams').doc(examId).collection('questions');
    let successCount = 0;
    let errorCount = 0;
    for (const q of questions) {
        try {
            await collectionRef.add({
                questionText: q.questionText,
                options: [q.option1, q.option2, q.option3, q.option4],
                correctAnswerIndex: Number(q.correctAnswerIndex),
            });
            successCount++;
        } catch (error) {
            errorCount++;
        }
    }
    return { message: `Import finished. Success: ${successCount}, Failed: ${errorCount}` };
});


// --- ฟังก์ชันสำหรับแจ้งเตือน ---

// ส่งข้อความด่วนหาทุกคน (ต้องใช้แผน Blaze)
exports.sendPushNotificationToAll = functions.https.onCall(async (data, context) => {
  const { title, body } = data;
  if (!title || !body) {
    throw new functions.https.HttpsError("invalid-argument", "ต้องมี title และ body");
  }
  const usersSnapshot = await admin.firestore().collection("users").get();
  const tokens = [];
  usersSnapshot.forEach((doc) => {
    const user = doc.data();
    if (user.pushToken) {
      tokens.push(user.pushToken);
    }
  });
  if (tokens.length === 0) {
    return { success: true, message: "ไม่พบผู้ใช้ที่มี Token" };
  }
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Accept-Encoding": "gzip, deflate",
    },
    body: JSON.stringify(tokens.map(token => ({
      to: token,
      sound: "default",
      title: title,
      body: body,
    }))),
  });
  if (!response.ok) {
    const responseBody = await response.text();
    throw new functions.https.HttpsError("unknown", `Expo server error: ${responseBody}`);
  }
  return { success: true, message: `ส่งแจ้งเตือนไปยัง ${tokens.length} อุปกรณ์สำเร็จ` };
});

// แจ้งเตือนอัตโนมัติเมื่อมีกิจกรรมใหม่ (ต้องใช้แผน Blaze)
exports.sendNotificationOnNewActivity = functions.firestore
  .document('upcomingActivities/{activityId}')
  .onCreate(async (snap, context) => {
    const newActivity = snap.data();
    const activityTitle = newActivity.title;
    console.log(`New activity created: ${activityTitle}.`);
    const notificationTitle = "กิจกรรมใหม่!";
    const notificationBody = `ขอเชิญเข้าร่วมกิจกรรม: ${activityTitle}`;
    const usersSnapshot = await admin.firestore().collection("users").get();
    const tokens = [];
    usersSnapshot.forEach((doc) => {
      const user = doc.data();
      if (user.pushToken) {
        tokens.push(user.pushToken);
      }
    });
    if (tokens.length === 0) {
      console.log("No users with push tokens found.");
      return null;
    }
    try {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tokens.map(token => ({
          to: token,
          sound: "default",
          title: notificationTitle,
          body: notificationBody,
        }))),
      });
      console.log(`Notifications sent for new activity to ${tokens.length} users.`);
      return { success: true };
    } catch (error) {
      console.error("Error sending push notifications:", error);
      return { success: false, error: error.message };
    }
  });
