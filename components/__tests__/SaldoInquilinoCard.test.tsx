import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SaldoInquilinoCard from "@/components/SaldoInquilinoCard";

describe("SaldoInquilinoCard", () => {
  it("muestra el monto con signo de pesos", () => {
    render(<SaldoInquilinoCard nombre="Ana Pérez" saldoActual={2300} />);

    expect(screen.getByText(/\$2,300/)).toBeInTheDocument();
  });
});
