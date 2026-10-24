import { StatisticsApi } from "../../api/StatisticsApi.js";
import { BuildTransactionReport } from "./TransactionReport.js";

export async function GetTransactionReport(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  const from = `${year}-${String(monthNumber).padStart(2, "0")}-01`;
  const to = `${year}-${String(monthNumber).padStart(2, "0")}-${String(new Date(year, monthNumber, 0).getDate()).padStart(2, "0")}`;
  const pageSize = 50;
  const firstResponse = await StatisticsApi.getTransactions(from, to, 1, pageSize, "all");
  if (!firstResponse.success) throw new Error("A havi tranzakciók lekérése sikertelen.");
  const firstPage = firstResponse.data ?? {};
  let remainingResponses;
  if (firstPage.totalCount !== null && firstPage.totalCount !== undefined && Number.isFinite(Number(firstPage.totalCount))) {
    const pageCount = Math.ceil(Number(firstPage.totalCount) / pageSize);
    remainingResponses = await Promise.all(
      Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
        StatisticsApi.getTransactions(from, to, index + 2, pageSize, "all"),
      ),
    );
  } else {
    remainingResponses = [];
    let page = 2;
    let previousLength = firstPage.items?.length ?? 0;
    while (previousLength === pageSize) {
      const response = await StatisticsApi.getTransactions(from, to, page++, pageSize, "all");
      if (!response.success) throw new Error("A tranzakciók további oldalainak lekérése sikertelen.");
      previousLength = response.data?.items?.length ?? 0;
      remainingResponses.push(response);
    }
  }
  const failedResponse = remainingResponses.find((response) => !response.success);
  if (failedResponse) throw new Error("A tranzakciók további oldalainak lekérése sikertelen.");
  const data = {
    ...firstPage,
    items: [
      ...(firstPage.items ?? []),
      ...remainingResponses.flatMap((response) => response.data?.items ?? []),
    ],
  };
  return BuildTransactionReport(data);
}
