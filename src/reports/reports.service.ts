import { Injectable, NotFoundException } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { constants, existsSync, mkdirSync } from 'fs';
import { ReportFiltersType } from './dto/report.schema';
import { Borrowings } from '@base/borrowings/models/borrowing.model';
import { Op } from 'sequelize';
import { access } from 'fs/promises';
@Injectable()
export class ReportsService {
  private DIRECTORY = 'report_files';
  private attributes = [
    'id',
    'user_id',
    'book_id',
    'is_returned',
    'is_overdue',
    'return_date',
    'due_date',
    'created_at',
    'updated_at',
  ];
  async generate(filters: ReportFiltersType): Promise<string> {
    let defaultWhere: { [key: string]: any } = {};
    if (filters.from) {
      defaultWhere['created_at'] = { [Op.gte]: filters.from };
    }
    if (filters.to) {
      defaultWhere['created_at'] = { [Op.lte]: filters.to };
    }
    const books = await Borrowings.findAll({
      where: defaultWhere,
      attributes: this.attributes,
    });
    const filePath = await this.createExcelFile(books);
    return filePath;
  }

  async download(id: number) {
    // check if directory exist
    if (!existsSync(`./${this.DIRECTORY}`)) {
      throw new NotFoundException('File not found');
    }
    const filePath = `./${this.DIRECTORY}/${id}.xlsx`;
    try {
      await access(filePath, constants.R_OK | constants.W_OK);
      return filePath;
    } catch {
      throw new NotFoundException('File not found');
    }
  }

  async createExcelFile(books: Borrowings[]): Promise<string> {
    let rows = [];
    books.forEach((doc) => {
      rows.push(Object.values(doc.dataValues));
    });
    let book = new Workbook();

    let sheet = book.addWorksheet('sheet1');

    rows.unshift(this.attributes);

    sheet.addRows(rows);

    // create directory if not exist
    !existsSync(`./${this.DIRECTORY}`) && mkdirSync(`./${this.DIRECTORY}`);
    const fileName = Date.now();
    const filePath = `./${this.DIRECTORY}/${fileName}.xlsx`;
    await book.xlsx.writeFile(filePath);
    return fileName.toString();
  }
}
