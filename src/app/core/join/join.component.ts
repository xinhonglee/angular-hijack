import { Component, OnInit } from "@angular/core"
import { LocalStorageService } from "angular-2-local-storage"

@Component({
  selector: "app-join",
  templateUrl: "./join.component.html",
  styleUrls: ["./join.component.scss"]
})
export class JoinComponent implements OnInit {
  public logoPath = "assets/images/LOGO.png"
  public information = "More information"

  public switchUrl
  public switchText

  public fox = "assets/images/METAMASK.png"
  public wallet = "assets/images/PREPARE_WALLET.png"
  public paySpot = "assets/images/PAY_YOUR_SPOT.png"
  public friends = "assets/images/REFER_FRIENDS.png"

  public isMobileSelected

  constructor(private localstorageService: LocalStorageService) {
    this.isMobileSelected = true
    const hasSpot = localstorageService.get("hasSpot")

    if (hasSpot) {
      this.switchUrl = "/account"
      this.switchText = "Account"
    } else {
      this.switchUrl = "/join"
      this.switchText = "Join"
    }
  }

  onTextToggle(selected: boolean) {
    this.isMobileSelected = selected
  }

  ngOnInit() {}
}
