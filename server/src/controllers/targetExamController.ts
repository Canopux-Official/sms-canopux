import { Request, Response } from "express";
import TargetExam from "../models/TargetExam";

export const getAllExams = async (req: Request, res: Response) => {
    try {
        const exams = await TargetExam.find({}).sort({ name: 1 });
        return res.status(200).json(exams);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching exams", error });
    }
};

export const addExam = async (req: Request, res: Response) => {
    try {
        const { name, isActive } = req.body;
        if (!name) return res.status(400).json({ message: "Name is required" });

        const newExam = await TargetExam.create({ name, isActive });
        return res.status(201).json(newExam);
    } catch (error) {
        return res.status(500).json({ message: "Error adding exam", error });
    }
};

export const updateExam = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedExam = await TargetExam.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedExam) return res.status(404).json({ message: "Exam not found" });
        return res.status(200).json(updatedExam);
    } catch (error) {
        return res.status(500).json({ message: "Error updating exam", error });
    }
};

export const deleteExam = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await TargetExam.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Exam not found" });
        return res.status(200).json({ message: "Exam deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting exam", error });
    }
};
export const getAllActiveExams = async (req: Request, res: Response) => {
    try {
        const exams = await TargetExam.find({isActive: true}).sort({ name: 1 });
        return res.status(200).json(exams);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching exams", error });
    }
};
export const getTargetExamCount = async () => {
    try {
        const count = await TargetExam.countDocuments({});
        return count;
    } catch (error) {
        return {
            message: "Error fetching target exam count",
            error
        };
    }
};
export const getActiveTargetExamCount = async () => {
    try {
        const count = await TargetExam.countDocuments({ isActive: true });
        return count
    } catch (error) {
        return {
            message: "Error fetching active target exam count",
            error
        };
    }
};