import { Schema, model, models } from 'mongoose';

const StudentSchema = new Schema ({
    studentId: { type: String, require: true, unique: true },
    fullName: { type: String, require: true },
}, { timestamps: true});

export const Student = models.Student || model('Student', StudentSchema);