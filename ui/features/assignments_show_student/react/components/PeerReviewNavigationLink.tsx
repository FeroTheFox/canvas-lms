/*
 * Copyright (C) 2023 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useState} from 'react'
import {useScope as useI18nScope} from '@canvas/i18n'
// @ts-expect-error
import {Popover} from '@instructure/ui-popover'
// @ts-expect-error
import {IconPeerReviewLine, IconCheckLine} from '@instructure/ui-icons'
// @ts-expect-error
import {TruncateText} from '@instructure/ui-truncate-text'
// @ts-expect-error
import {Tooltip} from '@instructure/ui-tooltip'
import {Menu} from '@instructure/ui-menu'
import {Flex} from '@instructure/ui-flex'
import {View} from '@instructure/ui-view'
import {Text} from '@instructure/ui-text'
import {Link} from '@instructure/ui-link'
import {getPeerReviewUrl} from '../helpers/PeerReviewHelpers'
import {AssignedAssessments} from 'api'
import {AccessibleContent} from '@instructure/ui-a11y-content'

const I18n = useI18nScope('assignments_2_student_header')

const {Item: MenuItem, Group: MenuGroup} = Menu as any

type PeerReviewNavigationLinkProps = {
  assignedAssessments: AssignedAssessments[]
  currentAssessmentIndex: number
}

type NavigationMenuItemLabelProps = {
  assessment: AssignedAssessments
  index: number
  peerReviewStatus: string
}

const TruncateWithTooltip = ({children}: {children: React.ReactNode}) => {
  const [isTruncated, setIsTruncated] = useState(false)
  return isTruncated ? (
    <Tooltip as="div" placement="start" renderTip={children}>
      <TruncateText position="middle" onUpdate={setIsTruncated}>
        {children}
      </TruncateText>
    </Tooltip>
  ) : (
    <TruncateText onUpdate={setIsTruncated} position="middle">
      {children}
    </TruncateText>
  )
}

const NavigationMenuItemLabel = ({
  assessment,
  index,
  peerReviewStatus,
}: NavigationMenuItemLabelProps) => {
  const label = assessment.anonymizedUser
    ? assessment.anonymizedUser?.displayName
    : I18n.t('Anonymous %{peerReviewNumber}', {peerReviewNumber: index + 1})
  return (
    <AccessibleContent alt={`${label} ${peerReviewStatus}`}>
      <TruncateWithTooltip>{label}</TruncateWithTooltip>
    </AccessibleContent>
  )
}

export default ({assignedAssessments, currentAssessmentIndex}: PeerReviewNavigationLinkProps) => {
  const renderNavigationMenuItem = (
    assessment: AssignedAssessments,
    index: number,
    testId: string,
    peerReviewStatus: string
  ) => {
    return (
      <MenuItem
        key={assessment.assetId}
        href={getPeerReviewUrl(assessment)}
        /* currentAssessmentIndex is a passed in prop that is already 1-indexed while the parameter 'index' is 0-indexed, hence the need for a +1.
           This is comparing to see if the current peer review page we are on matches the current item in the map, which will then add a custom background
           to the theme to the rendered menu item.
        */
        theme={
          currentAssessmentIndex === index + 1 ? {background: '#6B7780', labelColor: 'white'} : null
        }
        data-testid={`${testId}-${assessment.assetId}`}
      >
        <Flex as="div">
          {testId === 'peer-review-completed' ? (
            <View margin="0 x-small 0 0">
              <IconCheckLine />
            </View>
          ) : (
            <View margin="0 medium 0 0" />
          )}
          <NavigationMenuItemLabel
            assessment={assessment}
            index={index}
            peerReviewStatus={peerReviewStatus}
          />
        </Flex>
      </MenuItem>
    )
  }

  return (
    <Popover
      renderTrigger={
        <View as="div" margin="xx-small 0 xx-small xx-small" data-testid="header-peer-review-link">
          <View margin="0 xx-small 0 0">
            <IconPeerReviewLine />
          </View>
          <Link as="button" isWithinText={false}>
            <Text weight="bold" size="small" color="brand">
              {I18n.t('Required Peer Reviews')}
            </Text>
          </Link>
        </View>
      }
      on="click"
      placement="bottom end"
    >
      <Menu>
        <MenuGroup label={I18n.t('Ready to Review')} />
        {assignedAssessments?.map(
          (assessment, index) =>
            assessment.assetSubmissionType != null &&
            assessment.workflowState === 'assigned' &&
            renderNavigationMenuItem(
              assessment,
              index,
              'peer-review-ready',
              I18n.t('Ready to Review')
            )
        )}

        <MenuGroup label={I18n.t('Not Yet Submitted')} />
        {assignedAssessments?.map(
          (assessment, index) =>
            assessment.assetSubmissionType === null &&
            renderNavigationMenuItem(
              assessment,
              index,
              'peer-review-not-submitted',
              I18n.t('Peer Review Not Yet Submitted')
            )
        )}

        <MenuGroup label={I18n.t('Completed Peer Reviews')} />
        {assignedAssessments?.map(
          (assessment, index) =>
            assessment.assetSubmissionType != null &&
            assessment.workflowState === 'completed' &&
            renderNavigationMenuItem(
              assessment,
              index,
              'peer-review-completed',
              I18n.t('Peer Review Completed')
            )
        )}
      </Menu>
    </Popover>
  )
}
