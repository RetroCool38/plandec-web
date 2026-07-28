import { ContentRepository } from "../repositories/content.repository";

export class ContentService {
  private repository: ContentRepository;

  constructor() {
    this.repository = new ContentRepository();
  }

  getHomeContent() {
    return this.repository.getHomeContent();
  }
}