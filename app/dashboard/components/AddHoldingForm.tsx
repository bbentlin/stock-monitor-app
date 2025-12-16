"use client";

import React, { useState } from "react";
import { Holding } from "@/lib/hooks/useHoldings";
import { useStockSearch } from "@/lib/hooks/useStockSearch";
import { useStockQuote } from "@/lib/hooks/useStockQuote";

interface AddHoldingFormProps {
  onAdd: (holding: Omit<Holding, "id">) => void;
}

const AddHoldingForm: React.FC<AddHoldingFormProps> = ({ onAdd }) => {
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0] // Default to today
  );
  const [showSearch, setShowSearch] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string } | null>(null);

  const { results, loading: searchLoading, search } = useStockSearch();
  const { quote, loading: quoteLoading, fetchQuote } = useStockQuote();

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setSymbol(value);
    setSelectedStock(null);

    if (value.length >= 1) {
      setShowSearch(true);
      search(value);
    } else {
      setShowSearch(false);
    }
  };

  const handleSelectStock = async (stock: { symbol: string; description: string }) => {
    setSymbol(stock.symbol);
    setSelectedStock({ symbol: stock.symbol, name: stock.description });
    setShowSearch(false);

    // Fetch current price
    await fetchQuote(stock.symbol);
  };

  const handleUseCurrentPrice = () => {
    if (quote?.currentPrice) {
      setPurchasePrice(quote.currentPrice.toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStock || !shares || !purchasePrice) {
      return;
    }

    const sharesNum = parseFloat(shares);
    const priceNum = parseFloat(purchasePrice);
    const currentPrice = quote?.currentPrice || priceNum;
    const value = sharesNum * currentPrice;
    const costBasis = sharesNum * priceNum;
    const gainLoss = value - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

    onAdd({
      
    })
  }
}