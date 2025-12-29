import { Schema, model, models } from  'mongoose';

const TimeLogSchema = new Schema ({
    studentId: { type: String, required: true },
    fullName: { type: String, required: true },
    date: { type: String, required: true },
    timeIn: { type: Date },
    timeOut: { type: Date},
})

export const TimeLog = models.TimeLog || model('TimeLog', TimeLogSchema);