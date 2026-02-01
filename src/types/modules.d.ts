declare module 'recharts' {
    export interface TooltipProps<TValue, TName> {
        active?: boolean
        payload?: any[]
        label?: any
        coordinate?: {
            x: number
            y: number
        }
    }

    export const ResponsiveContainer: any
    export const LineChart: any
    export const Line: any
    export const PieChart: any
    export const Pie: any
    export const BarChart: any
    export const Bar: any
    export const XAxis: any
    export const YAxis: any
    export const CartesianGrid: any
    export const Tooltip: any
    export const Legend: any
    export const Cell: any
}

declare module 'jspdf' {
    interface jsPDF {
        text(text: string | string[], x: number, y: number, options?: any): jsPDF
        splitTextToSize(text: string, width: number): string[]
        setFont(fontName: string, fontStyle?: string): jsPDF
        setFontSize(size: number): jsPDF
        setTextColor(...args: number[]): jsPDF
        setDrawColor(...args: number[]): jsPDF
        setFillColor(...args: number[]): jsPDF
        line(x1: number, y1: number, x2: number, y2: number): jsPDF
        addPage(): jsPDF
        setPage(page: number): jsPDF
        getNumberOfPages(): number
        internal: {
            pageSize: {
                getWidth(): number
                getHeight(): number
            }
        }
        lastAutoTable?: {
            finalY: number
        }
        output(format: string): Blob
        save(filename: string): void
    }

    interface jsPDFConstructor {
        new (options?: any): jsPDF
    }

    const jsPDF: jsPDFConstructor
    export default jsPDF
}

declare module 'jspdf-autotable' {
    import { jsPDF } from 'jspdf'

    interface AutoTableOptions {
        startY: number
        head: string[][]
        body: string[][]
        theme?: 'grid' | 'plain' | 'striped'
        styles?: any
        headStyles?: any
        columnStyles?: any
        didParseCell?: any
        willDrawCell?: any
        didDrawCell?: any
        didDrawPage?: any
    }

    function autoTable(doc: jsPDF, options: AutoTableOptions): void

    export default autoTable
}

declare module 'xlsx' {
    export interface WorkBook {
        SheetNames: string[]
        Sheets: { [key: string]: WorkSheet }
    }

    export interface WorkSheet {
        [key: string]: any
        '!cols'?: Array<{ wch?: number }>
        '!ref'?: string
    }

    export interface Range {
        s: { c: number; r: number }
        e: { c: number; r: number }
    }

    export interface AOA {
        [key: string]: any
    }

    export namespace utils {
        function book_new(): WorkBook
        function book_append_sheet(workbook: WorkBook, worksheet: WorkSheet, name: string): void
        function aoa_to_sheet(data: any[][]): WorkSheet
        function sheet_to_json(sheet: WorkSheet): any[]
        function json_to_sheet(data: any[]): WorkSheet
    }

    export function write(workbook: WorkBook, options: { bookType: string; type: string }): ArrayBuffer
    export function writeFile(workbook: WorkBook, filename: string): void

    export const version: string
}
