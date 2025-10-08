"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summaries = exports.signals = exports.emptySummaries = exports.emptySignals = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
exports.supabase = new supabase_js_1.SupabaseClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const emptySignals = async () => {
    const { data, error } = await exports.supabase
        .from(process.env.SIGNALS_TABLE)
        .delete()
        .neq("id", 0);
    if (error)
        throw new Error(error.message);
    return;
};
exports.emptySignals = emptySignals;
const emptySummaries = async () => {
    const { data, error } = await exports.supabase
        .from(process.env.SUMMARIES_TABLE)
        .delete()
        .neq("id", 0);
    if (error)
        throw new Error(error.message);
    return;
};
exports.emptySummaries = emptySummaries;
exports.signals = {
    list: async (factor) => {
        if (factor) {
            const { data, error } = await exports.supabase
                .from(process.env.SIGNALS_TABLE)
                .select("*")
                .eq("factor", factor);
            if (error)
                throw new Error(error.message);
            return data;
        }
        else {
            const { data, error } = await exports.supabase
                .from(process.env.SIGNALS_TABLE)
                .select("*");
            if (error)
                throw new Error(error.message);
            return data;
        }
    },
    write: async (signal) => {
        const { data, error } = await exports.supabase
            .from(process.env.SIGNALS_TABLE)
            .insert(signal)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    batchWrite: async (signals) => {
        const { data, error } = await exports.supabase
            .from(process.env.SIGNALS_TABLE)
            .insert([...signals])
            .select();
        if (error)
            throw new Error(error.message);
        return data;
    },
};
exports.summaries = {
    write: async (summary) => {
        const { data, error } = await exports.supabase
            .from(process.env.SUMMARIES_TABLE)
            .insert(summary)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
    update: async (summary) => {
        const { data, error } = await exports.supabase
            .from(process.env.SUMMARIES_TABLE)
            .update(summary)
            .eq("id", summary.id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    },
};
