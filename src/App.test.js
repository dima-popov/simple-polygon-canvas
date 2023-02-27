import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders area", () => {
  render(<App />);
  const linkElement = screen.getByText(/Area/i);
  expect(linkElement).toBeInTheDocument();
});
