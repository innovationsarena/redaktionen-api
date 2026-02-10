import { describe, it, expect, vi } from "vitest";
import { AppError, handleControllerError, asyncHandler } from "../../core/utils/errorHandler";

describe("AppError", () => {
  it("creates error with default statusCode 500", () => {
    const error = new AppError("Something broke");
    expect(error.message).toBe("Something broke");
    expect(error.statusCode).toBe(500);
    expect(error.isOperational).toBe(true);
  });

  it("creates error with custom statusCode", () => {
    const error = new AppError("Not found", 404);
    expect(error.statusCode).toBe(404);
  });

  it("creates error with isOperational false", () => {
    const error = new AppError("System failure", 500, false);
    expect(error.isOperational).toBe(false);
  });

  it("is an instance of Error", () => {
    const error = new AppError("test");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it("has a stack trace", () => {
    const error = new AppError("test");
    expect(error.stack).toBeDefined();
  });
});

describe("handleControllerError", () => {
  function createMockReply() {
    const reply: any = {
      log: { error: vi.fn() },
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    return reply;
  }

  it("handles AppError with correct statusCode", () => {
    const reply = createMockReply();
    const error = new AppError("Not found", 404);

    handleControllerError(error, reply);

    expect(reply.status).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({ error: "Not found" });
  });

  it("handles generic Error with 500", () => {
    const reply = createMockReply();
    const error = new Error("generic error");

    handleControllerError(error, reply);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ error: "generic error" });
  });

  it("handles unknown error type", () => {
    const reply = createMockReply();

    handleControllerError("string error", reply);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ error: "Internal server error" });
  });
});

describe("asyncHandler", () => {
  function createMockReply() {
    const reply: any = {
      log: { error: vi.fn() },
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    return reply;
  }

  it("passes through successful results", async () => {
    const handler = asyncHandler(async (_req: any, reply: any) => {
      return reply.status(200).send({ ok: true });
    });

    const reply = createMockReply();
    await handler({}, reply);

    expect(reply.status).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({ ok: true });
  });

  it("catches errors and calls handleControllerError", async () => {
    const handler = asyncHandler(async () => {
      throw new AppError("Boom", 422);
    });

    const reply = createMockReply();
    await handler({}, reply);

    expect(reply.status).toHaveBeenCalledWith(422);
    expect(reply.send).toHaveBeenCalledWith({ error: "Boom" });
  });

  it("catches generic errors", async () => {
    const handler = asyncHandler(async () => {
      throw new Error("Unexpected");
    });

    const reply = createMockReply();
    await handler({}, reply);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({ error: "Unexpected" });
  });
});
