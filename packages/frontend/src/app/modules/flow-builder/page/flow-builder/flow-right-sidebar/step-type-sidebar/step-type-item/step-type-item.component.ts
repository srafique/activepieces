import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { FlowItemDetails } from './flow-item-details';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Observable, tap } from 'rxjs';
import { fadeIn400ms } from 'packages/frontend/src/app/modules/common/animation/fade-in.animations';

@Component({
	selector: 'app-step-type-item',
	templateUrl: './step-type-item.component.html',
	styleUrls: ['./step-type-item.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [fadeIn400ms],
})
export class StepTypItemComponent {
	_flowItemDetails: FlowItemDetails;
	_flowItemDetails$: Observable<FlowItemDetails | undefined>;
	@Input() clickable = true;
	@Input() set flowItemDetails(value: FlowItemDetails) {
		this._flowItemDetails = value;
		this.loadStepIcon(this._flowItemDetails.logoUrl || '');
	}
	@Input() set flowItemDetails$(value: Observable<FlowItemDetails | undefined>) {
		this._flowItemDetails$ = value;
		if (this._flowItemDetails$) {
			this._flowItemDetails$ = this._flowItemDetails$.pipe(
				tap(res => {
					this.loadStepIcon(res?.logoUrl || '');
				})
			);
		}
	}
	stepIconUrl: string = '';
	faInfo = faInfoCircle;
	hover: boolean = false;
	constructor(private cd: ChangeDetectorRef) {}

	loadStepIcon(url: string) {
		const itemIcon = new Image();
		itemIcon.src = url;
		itemIcon.onload = () => {
			this.stepIconUrl = url;
			this.cd.detectChanges();
		};
	}
}
