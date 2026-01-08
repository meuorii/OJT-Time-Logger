import { Schema, model, models } from  'mongoose';

const TimeLogSchema = new Schema ({
    student: { type: Schema.Types.ObjectId, ref: 'Studeunt', required: true },
    studentId: { type: String, required: true },
    fullName: { type: String, required: true },
    date: { tyoe: String, required: true},
    amIn: { type: String, default: null },
    amOut: { type: String, default: null },
    pmIn: { type: String, default: null },
    pmOut: { type: String, default: null},
    otIn: { type: String, default: null },
    otOut: { type: String, default: null },
    totalHours: { type: Number, default: 0},
    status: { type: String, enum: ['Complete', 'Incomplete']},
}, { timestamps: true })

export const TimeLog = models.TimeLog || model('TimeLog', TimeLogSchema);