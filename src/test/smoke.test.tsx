import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("jsdom + testing-library smoke", () => {
  it("renders a React component", () => {
    render(<div data-testid="hello">hello world</div>);
    expect(screen.getByTestId("hello")).toHaveTextContent("hello world");
  });
});
